  // ==================== IMPORTS ====================
  import type { Express, Request, Response, NextFunction } from "express";
  import express from "express";
  import fs from "fs";
  import path from "path";
  import { createServer, type Server } from "http";
  import { storage } from "./storage";
  import { setupAuth, isAuthenticated } from "./replitAuth";
  import OpenAI from "openai";
  import { createClient } from "@supabase/supabase-js";
  import {
    agentEventSchema,
    ceoReminderSchema,
    executiveSummaryRequestSchema,
    governanceNotificationSchema,
    ruleBroadcastSchema,
    highPriorityNotificationSchema,
    chatRequestSchema,
    conversationSchema,
    arcFeedbackSchema,
    arcCommandLogSchema,
    supabaseAgentEventSchema,
    smellProfileSchema,
    bioSentinelChatSchema,
    VIRTUAL_AGENTS,
    SMELL_CATEGORIES,
    type ExecutiveSummaryResponse,
    type ApiSuccessResponse,
    type ApiErrorResponse,
    type AgentType,
    type ChatMessage,
    type SmellProfile,
  } from "@shared/schema";
  import { WebSocketServer, WebSocket } from "ws";
  import { ZodError } from "zod";

  // ==================== OPENAI CONFIG ====================
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // ==================== AUTH MIDDLEWARE ====================
  function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const secret = req.headers["x-arc-secret"];
    const expectedSecret = process.env.ARC_BACKEND_SECRET;

    if (!expectedSecret) {
      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({ status: "error", message: "Server missing ARC_BACKEND_SECRET" });
      }
      return next(); // Dev mode skip
    }

    if (secret !== expectedSecret) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    next();
  }

  // ==================== HELPER FUNCTIONS ====================
  function sendError(res: Response, status: number, message: string, details?: unknown) {
    res.status(status).json({ status: "error", message, details });
  }

  function sendSuccess(res: Response, data?: unknown) {
    res.status(200).json(data ? data : { status: "ok" });
  }

  // ==================== MAIN ROUTE REGISTRATION ====================
  export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
    // Setup Replit Auth
    await setupAuth(app);

    // Auth check route
    app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
      const userId = req.user?.claims?.sub;
      if (!userId) return sendError(res, 401, "Unauthorized");
      const user = await storage.getUser(userId);
      if (!user) return sendError(res, 404, "User not found");
      sendSuccess(res, user);
    });

    // Apply ARC auth to /api/arc
    app.use("/api/arc", authMiddleware);

    // ==================== HEALTH ====================
    app.get("/api/health", (_req, res) => {
      res.json({
        status: "ok",
        service: "ARC Virtual Office",
        timestamp: new Date().toISOString(),
      });
    });

    // ==================== AGENTS ====================
    app.get("/api/agents", (_req, res) => sendSuccess(res, VIRTUAL_AGENTS));

    // ==================== CHAT ====================
    app.post("/api/chat", isAuthenticated, async (req: any, res) => {
      try {
        const parsed = chatRequestSchema.parse(req.body);
        const userId = req.user?.claims?.sub;
        if (!userId) return sendError(res, 401, "User not authenticated");

        let conversationId = parsed.conversationId;
        if (!conversationId) {
          const conv = await storage.createConversation({ title: parsed.message, activeAgents: parsed.activeAgents }, userId);
          conversationId = conv.id;
        }

        const history = await storage.getMessages(conversationId);

        const responses = [];
        for (const agentId of parsed.activeAgents) {
          const agent = VIRTUAL_AGENTS.find((a) => a.id === agentId);
          if (!agent) continue;

          const resp = await openai.chat.completions.create({
            model: "gpt-5",
            messages: [
              { role: "system", content: agent.systemPrompt },
              ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
              { role: "user", content: parsed.message },
            ],
          });

          responses.push({
            agentId,
            name: agent.name,
            content: resp.choices[0].message.content,
          });
        }

        sendSuccess(res, { conversationId, responses });
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // ==================== TEXT-TO-SPEECH (ElevenLabs) ====================
    app.post("/api/tts", isAuthenticated, async (req: Request, res: Response) => {
      try {
        const { text, voice } = req.body;
        if (!text) return sendError(res, 400, "Text is required");

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) return sendError(res, 500, "ElevenLabs API key not configured");

        const voiceId = voice || "pNInz6obpgDQGcFmaJgB";

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          return sendError(res, response.status, `ElevenLabs error: ${errText}`);
        }

        const audioBuffer = Buffer.from(await response.arrayBuffer());
        sendSuccess(res, { audio: audioBuffer.toString("base64"), status: "ok" });
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // ==================== ARC BRAIN STATE ====================
    app.get("/api/arc/brain/state", async (_req, res) => {
      try {
        const manifestPath = path.join(process.cwd(), "arc_core", "brain_manifest.json");
        if (!fs.existsSync(manifestPath)) return sendError(res, 404, "Brain manifest not found");
        const data = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

        const safeData = {
          system_version: data.system_version,
          environment: data.environment,
          agents: data.agents,
          modules: data.modules,
          status: data.status,
        };
        sendSuccess(res, { brain: safeData });
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // ==================== ARC SELF-AWARENESS ====================
    app.get("/api/arc/brain/self-awareness", async (_req, res) => {
      try {
        const selfPath = path.join(process.cwd(), "arc_core", "brain_self-awareness.json");
        if (!fs.existsSync(selfPath)) return sendError(res, 404, "Self-awareness file not found");
        const data = JSON.parse(fs.readFileSync(selfPath, "utf-8"));
        sendSuccess(res, { selfAwareness: data });
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // ==================== SUPABASE TEST ====================
    app.get("/api/arc/db/test", async (_req, res) => {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) return sendError(res, 500, "Supabase config missing");

      try {
        const r = await fetch(`${url}/rest/v1/agent_events?select=*`, {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        });
        const data = await r.json();
        sendSuccess(res, { count: data.length });
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // ==================== X BIO SENTINEL ROUTES ====================

    // In-memory storage for smell profiles (will be replaced with DB)
    const smellProfiles: SmellProfile[] = [];
    const bioSentinelClients: Set<WebSocket> = new Set();

    // GET smell profiles
    app.get("/api/bio-sentinel/profiles", isAuthenticated, async (_req, res) => {
      try {
        sendSuccess(res, smellProfiles);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // POST create smell profile
    app.post("/api/bio-sentinel/profiles", isAuthenticated, async (req, res) => {
      try {
        const parsed = smellProfileSchema.parse(req.body);
        const newProfile: SmellProfile = {
          id: `prof-${Date.now()}`,
          name: parsed.name,
          category: parsed.category || null,
          subcategory: parsed.subcategory || null,
          description: parsed.description || null,
          featureVector: parsed.featureVector || null,
          baselineGas: parsed.baselineGas || null,
          peakGas: parsed.peakGas || null,
          deltaGas: parsed.deltaGas || null,
          avgTemperature: null,
          avgHumidity: null,
          samplesCount: 1,
          confidence: 80,
          tags: parsed.tags || null,
          metadata: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        smellProfiles.push(newProfile);
        sendSuccess(res, newProfile);
      } catch (e: any) {
        sendError(res, 400, e.message);
      }
    });

    // GET single profile
    app.get("/api/bio-sentinel/profiles/:id", isAuthenticated, async (req, res) => {
      try {
        const profile = smellProfiles.find((p) => p.id === req.params.id);
        if (!profile) return sendError(res, 404, "Profile not found");
        sendSuccess(res, profile);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // DELETE profile
    app.delete("/api/bio-sentinel/profiles/:id", isAuthenticated, async (req, res) => {
      try {
        const idx = smellProfiles.findIndex((p) => p.id === req.params.id);
        if (idx === -1) return sendError(res, 404, "Profile not found");
        smellProfiles.splice(idx, 1);
        sendSuccess(res);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // POST AI chat for smell analysis
    app.post("/api/bio-sentinel/chat", isAuthenticated, async (req, res) => {
      try {
        const parsed = bioSentinelChatSchema.parse(req.body);
        
        let contextInfo = "";
        if (parsed.context?.recentReadings && parsed.context.recentReadings.length > 0) {
          const readings = parsed.context.recentReadings;
          const avgGas = readings.reduce((a, r) => a + r.gasResistance, 0) / readings.length;
          const avgTemp = readings.reduce((a, r) => a + r.temperature, 0) / readings.length;
          const avgHum = readings.reduce((a, r) => a + r.humidity, 0) / readings.length;
          const avgIaq = readings.reduce((a, r) => a + (r.iaqScore || 0), 0) / readings.length;
          const avgVoc = readings.reduce((a, r) => a + (r.vocEquivalent || 0), 0) / readings.length;
          
          contextInfo = `
Current sensor readings (last ${readings.length} samples):
- Average Gas Resistance: ${avgGas.toFixed(0)} ohms
- Average Temperature: ${avgTemp.toFixed(1)}C
- Average Humidity: ${avgHum.toFixed(1)}%
- Average IAQ Score: ${avgIaq.toFixed(0)}
- Average VOC: ${avgVoc.toFixed(2)} ppm
${parsed.context.currentProfile ? `- Currently comparing to profile: ${parsed.context.currentProfile}` : ""}
`;
        }

        const systemPrompt = `You are an AI assistant specialized in analyzing electronic nose sensor data from a BME688 gas sensor. 
You help users understand air quality readings, identify smells, and provide insights about VOC (Volatile Organic Compounds).

Categories of smells you can identify:
${Object.entries(SMELL_CATEGORIES).map(([cat, subs]) => `- ${cat}: ${subs.join(", ")}`).join("\n")}

Provide helpful, accurate analysis. If you can't identify a specific smell, explain what the readings might indicate about air quality or suggest further testing.`;

        const resp = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `${contextInfo}\n\nUser question: ${parsed.message}` },
          ],
        });

        sendSuccess(res, { response: resp.choices[0].message.content });
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // Export profiles
    app.get("/api/bio-sentinel/export", isAuthenticated, async (_req, res) => {
      try {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=smell-profiles.json");
        res.json(smellProfiles);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // Import profiles
    app.post("/api/bio-sentinel/import", isAuthenticated, async (req, res) => {
      try {
        const profiles = req.body;
        if (!Array.isArray(profiles)) return sendError(res, 400, "Expected array of profiles");
        
        for (const p of profiles) {
          const parsed = smellProfileSchema.parse(p);
          const newProfile: SmellProfile = {
            id: `prof-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            name: parsed.name,
            category: parsed.category || null,
            subcategory: parsed.subcategory || null,
            description: parsed.description || null,
            featureVector: parsed.featureVector || null,
            baselineGas: parsed.baselineGas || null,
            peakGas: parsed.peakGas || null,
            deltaGas: parsed.deltaGas || null,
            avgTemperature: null,
            avgHumidity: null,
            samplesCount: 1,
            confidence: 80,
            tags: parsed.tags || null,
            metadata: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          smellProfiles.push(newProfile);
        }
        sendSuccess(res, { imported: profiles.length });
      } catch (e: any) {
        sendError(res, 400, e.message);
      }
    });

    // ==================== BIO SENTINEL WEBSOCKET ====================
    const wss = new WebSocketServer({ noServer: true });

    httpServer.on("upgrade", (request, socket, head) => {
      const url = new URL(request.url || "", `http://${request.headers.host}`);
      
      if (url.pathname === "/ws/bio-sentinel") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    wss.on("connection", (ws: WebSocket) => {
      console.log("[Bio Sentinel] New WebSocket connection");
      bioSentinelClients.add(ws);

      // Send initial status
      ws.send(JSON.stringify({
        type: "device_status",
        timestamp: Date.now(),
        payload: {
          mode: "idle",
          uptime_ms: 0,
          wifi_rssi: -50,
          sensor_healthy: true,
          last_calibration: null,
          errors: [],
        },
      }));

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log("[Bio Sentinel] Received:", message.type);
          
          // Handle commands from dashboard
          switch (message.type) {
            case "set_mode":
            case "set_heater_profile":
            case "start_calibration":
            case "start_capture":
            case "stop":
            case "request_status":
            case "restart":
              // Forward to all connected ESP32 devices (in real scenario)
              // For now, echo back confirmation
              ws.send(JSON.stringify({
                type: "command_ack",
                timestamp: Date.now(),
                payload: { command: message.type, status: "received" },
              }));
              break;
          }
        } catch (e) {
          console.error("[Bio Sentinel] Message parse error:", e);
        }
      });

      ws.on("close", () => {
        console.log("[Bio Sentinel] WebSocket disconnected");
        bioSentinelClients.delete(ws);
      });

      ws.on("error", (err) => {
        console.error("[Bio Sentinel] WebSocket error:", err);
        bioSentinelClients.delete(ws);
      });
    });

    // Broadcast to all connected clients
    const broadcastToBioSentinel = (message: object) => {
      const data = JSON.stringify(message);
      bioSentinelClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    };

    // Endpoint for ESP32 to send readings (HTTP fallback)
    app.post("/api/bio-sentinel/readings", async (req, res) => {
      try {
        const reading = req.body;
        broadcastToBioSentinel({
          type: "sensor_reading",
          timestamp: Date.now(),
          payload: reading,
        });
        sendSuccess(res);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    return httpServer;
  }