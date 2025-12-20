  // ==================== IMPORTS ====================
  import type { Express, Request, Response, NextFunction } from "express";
  import express from "express";
  import fs from "fs";
  import path from "path";
  import { createServer, type Server } from "http";
  import { storage } from "./storage";
  import { db } from "./db";
  import { setupAuth, isAuthenticated } from "./replitAuth";
  import OpenAI from "openai";
  import { createClient } from "@supabase/supabase-js";
  import { sql } from "drizzle-orm";
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
    wsEsp32MessageSchema,
    wsServerCommandSchema,
    wsCommandAckSchema,
    wsSensorReadingSchema,
    VIRTUAL_AGENTS,
    SMELL_CATEGORIES,
    type ExecutiveSummaryResponse,
    type ApiSuccessResponse,
    type ApiErrorResponse,
    type AgentType,
    type ChatMessage,
    type SmellProfile,
    type WsEsp32Message,
    type WsServerCommand,
    type WsDeviceStatus,
    type WsSensorReading,
    type WsCaptureComplete,
    type WsCalibrationComplete,
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

    // ==================== DASHBOARD DATA ENDPOINTS ====================
    
    // Get command logs from local PostgreSQL
    app.get("/api/dashboard/commands", isAuthenticated, async (_req, res) => {
      try {
        const result = await db.execute(sql`
          SELECT id, command, payload, status, duration_ms, source, created_at, completed_at
          FROM arc_command_log
          ORDER BY created_at DESC
          LIMIT 20
        `);
        sendSuccess(res, result.rows || []);
      } catch (e: any) {
        sendSuccess(res, []);
      }
    });

    // Get agent events from local PostgreSQL
    app.get("/api/dashboard/events", isAuthenticated, async (_req, res) => {
      try {
        const result = await db.execute(sql`
          SELECT id, event_id, agent_id, type, payload, created_at, received_at
          FROM agent_events
          ORDER BY received_at DESC
          LIMIT 20
        `);
        sendSuccess(res, result.rows || []);
      } catch (e: any) {
        sendSuccess(res, []);
      }
    });

    // Get feedback from local PostgreSQL
    app.get("/api/dashboard/feedback", isAuthenticated, async (_req, res) => {
      try {
        const result = await db.execute(sql`
          SELECT id, command_id, source, status, data, created_at
          FROM arc_feedback
          ORDER BY created_at DESC
          LIMIT 20
        `);
        sendSuccess(res, result.rows || []);
      } catch (e: any) {
        sendSuccess(res, []);
      }
    });

    // Get dashboard metrics
    app.get("/api/dashboard/metrics", isAuthenticated, async (_req, res) => {
      try {
        const [cmdResult, taskResult, activityResult] = await Promise.all([
          db.execute(sql`
            SELECT 
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE status = 'completed') as success,
              COUNT(*) FILTER (WHERE status = 'failed') as failed,
              AVG(duration_ms) as avg_response
            FROM arc_command_log
            WHERE created_at > NOW() - INTERVAL '7 days'
          `),
          db.execute(sql`
            SELECT 
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE status = 'completed') as completed,
              COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress
            FROM team_tasks
          `),
          db.execute(sql`
            SELECT COUNT(*) as count FROM activity_feed WHERE created_at > NOW() - INTERVAL '24 hours'
          `),
        ]);
        
        sendSuccess(res, {
          commands: cmdResult.rows?.[0] || { total: 0, success: 0, failed: 0, avg_response: 0 },
          tasks: taskResult.rows?.[0] || { total: 0, completed: 0, in_progress: 0 },
          activity24h: activityResult.rows?.[0]?.count || 0,
        });
      } catch (e: any) {
        sendSuccess(res, {
          commands: { total: 0, success: 0, failed: 0, avg_response: 0 },
          tasks: { total: 0, completed: 0, in_progress: 0 },
          activity24h: 0,
        });
      }
    });

    // ==================== TEAM TASKS ENDPOINTS ====================
    
    app.get("/api/team/tasks", isAuthenticated, async (_req, res) => {
      try {
        const result = await db.execute(sql`
          SELECT * FROM team_tasks ORDER BY created_at DESC LIMIT 50
        `);
        sendSuccess(res, result.rows || []);
      } catch (e: any) {
        sendSuccess(res, []);
      }
    });

    app.post("/api/team/tasks", isAuthenticated, async (req, res) => {
      try {
        const { title, description, assignedAgent, priority, dueDate, tags } = req.body;
        const tagsArray = Array.isArray(tags) && tags.length > 0 ? tags : null;
        const result = await db.execute(sql`
          INSERT INTO team_tasks (title, description, assigned_agent, priority, due_date, tags, status)
          VALUES (${title}, ${description || null}, ${assignedAgent || null}, ${priority || 'medium'}, ${dueDate || null}, ${tagsArray}, 'pending')
          RETURNING *
        `);
        sendSuccess(res, result.rows?.[0]);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    app.patch("/api/team/tasks/:id", isAuthenticated, async (req, res) => {
      try {
        const { id } = req.params;
        const { status, assignedAgent, priority } = req.body;
        const result = await db.execute(sql`
          UPDATE team_tasks 
          SET status = COALESCE(${status}, status),
              assigned_agent = COALESCE(${assignedAgent}, assigned_agent),
              priority = COALESCE(${priority}, priority),
              updated_at = NOW(),
              completed_at = CASE WHEN ${status} = 'completed' THEN NOW() ELSE completed_at END
          WHERE id = ${id}
          RETURNING *
        `);
        sendSuccess(res, result.rows?.[0]);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // ==================== ACTIVITY FEED ====================
    
    app.get("/api/activity", isAuthenticated, async (_req, res) => {
      try {
        const result = await db.execute(sql`
          SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT 50
        `);
        sendSuccess(res, result.rows || []);
      } catch (e: any) {
        sendSuccess(res, []);
      }
    });

    app.post("/api/activity", isAuthenticated, async (req, res) => {
      try {
        const { type, title, description, agentId, metadata } = req.body;
        const result = await db.execute(sql`
          INSERT INTO activity_feed (type, title, description, agent_id, metadata)
          VALUES (${type}, ${title}, ${description}, ${agentId}, ${JSON.stringify(metadata || {})})
          RETURNING *
        `);
        sendSuccess(res, result.rows?.[0]);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // ==================== WORKFLOW SIMULATIONS ====================
    
    app.get("/api/simulations", isAuthenticated, async (_req, res) => {
      try {
        const result = await db.execute(sql`
          SELECT * FROM workflow_simulations ORDER BY created_at DESC
        `);
        sendSuccess(res, result.rows || []);
      } catch (e: any) {
        sendSuccess(res, []);
      }
    });

    app.post("/api/simulations", isAuthenticated, async (req, res) => {
      try {
        const { name, description, steps } = req.body;
        const result = await db.execute(sql`
          INSERT INTO workflow_simulations (name, description, steps, status)
          VALUES (${name}, ${description}, ${JSON.stringify(steps || [])}, 'draft')
          RETURNING *
        `);
        sendSuccess(res, result.rows?.[0]);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    app.post("/api/simulations/:id/run", isAuthenticated, async (req, res) => {
      try {
        const { id } = req.params;
        // Run simulation logic would go here
        const result = await db.execute(sql`
          UPDATE workflow_simulations 
          SET last_run_at = NOW(), 
              last_result = ${JSON.stringify({ status: 'completed', timestamp: new Date().toISOString() })}
          WHERE id = ${id}
          RETURNING *
        `);
        sendSuccess(res, result.rows?.[0]);
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
          label: parsed.label || null,
          notes: parsed.notes || null,
          rawSignature: parsed.rawSignature || null,
          featureVector: parsed.featureVector || null,
          embeddingText: null,
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
            label: parsed.label || null,
            notes: parsed.notes || null,
            rawSignature: parsed.rawSignature || null,
            featureVector: parsed.featureVector || null,
            embeddingText: null,
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
    
    // Track ESP32 devices separately from dashboard clients
    const esp32Devices: Map<string, WebSocket> = new Map();
    let latestSensorReading: WsSensorReading | null = null;
    let latestDeviceStatus: WsDeviceStatus | null = null;

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

    // Send typed command acknowledgment
    const sendCommandAck = (ws: WebSocket, command: string, status: "received" | "executing" | "completed" | "failed", error?: string) => {
      const ack = {
        type: "command_ack" as const,
        timestamp: Date.now(),
        payload: { command, status, ...(error && { error }) },
      };
      ws.send(JSON.stringify(ack));
    };

    // Handle incoming ESP32 messages with validation
    const handleEsp32Message = (message: WsEsp32Message) => {
      switch (message.type) {
        case "sensor_reading":
          latestSensorReading = message;
          console.log(`[Bio Sentinel] Sensor reading from ${message.payload.device_id}: gas=${message.payload.gas_resistance}, temp=${message.payload.temperature}°C`);
          break;
        case "device_status":
          latestDeviceStatus = message;
          const deviceId = `esp32-${message.timestamp}`;
          console.log(`[Bio Sentinel] Device status: mode=${message.payload.mode}, healthy=${message.payload.sensor_healthy}`);
          break;
        case "capture_complete":
          console.log(`[Bio Sentinel] Capture complete: ${message.payload.capture_id}, samples=${message.payload.samples_count}, success=${message.payload.success}`);
          break;
        case "calibration_complete":
          console.log(`[Bio Sentinel] Calibration complete: success=${message.payload.success}, baseline=${message.payload.baseline_gas}`);
          break;
      }
      // Broadcast to all dashboard clients
      broadcastToBioSentinel(message);
    };

    // Handle dashboard commands with validation
    const handleDashboardCommand = (ws: WebSocket, command: WsServerCommand) => {
      console.log(`[Bio Sentinel] Command: ${command.type}`);
      
      // Validate and forward to ESP32 devices
      switch (command.type) {
        case "set_mode":
          console.log(`[Bio Sentinel] Setting mode to: ${command.payload.mode}`);
          break;
        case "set_heater_profile":
          console.log(`[Bio Sentinel] Setting heater profile: ${command.payload.profile}`);
          break;
        case "start_calibration":
          console.log(`[Bio Sentinel] Starting calibration, duration: ${command.payload.duration_seconds || 60}s`);
          break;
        case "start_capture":
          console.log(`[Bio Sentinel] Starting capture: ${command.payload.capture_id}, duration: ${command.payload.duration_seconds}s`);
          break;
        case "stop":
          console.log(`[Bio Sentinel] Stopping current operation`);
          break;
        case "request_status":
          console.log(`[Bio Sentinel] Status requested`);
          // Send cached status if available
          if (latestDeviceStatus) {
            ws.send(JSON.stringify(latestDeviceStatus));
          }
          break;
        case "restart":
          console.log(`[Bio Sentinel] Restart requested: ${command.payload?.reason || 'no reason'}`);
          break;
      }
      
      // Forward to all ESP32 devices
      esp32Devices.forEach((device) => {
        if (device.readyState === WebSocket.OPEN) {
          device.send(JSON.stringify(command));
        }
      });
      
      // Acknowledge command receipt
      sendCommandAck(ws, command.type, "received");
    };

    wss.on("connection", (ws: WebSocket) => {
      console.log("[Bio Sentinel] New WebSocket connection");
      bioSentinelClients.add(ws);

      // Send initial status (simulated for demo)
      const initialStatus: WsDeviceStatus = {
        type: "device_status",
        timestamp: Date.now(),
        payload: {
          mode: "idle",
          uptime_ms: 0,
          wifi_rssi: -50,
          sensor_healthy: true,
          last_calibration: null,
          heater_profile: "standard",
          firmware_version: "1.0.0",
          free_heap: 200000,
          errors: [],
        },
      };
      ws.send(JSON.stringify(initialStatus));

      ws.on("message", (data) => {
        try {
          const rawMessage = JSON.parse(data.toString());
          
          // Try to parse as ESP32 message first
          const esp32Result = wsEsp32MessageSchema.safeParse(rawMessage);
          if (esp32Result.success) {
            handleEsp32Message(esp32Result.data);
            return;
          }
          
          // Try to parse as dashboard command
          const commandResult = wsServerCommandSchema.safeParse(rawMessage);
          if (commandResult.success) {
            handleDashboardCommand(ws, commandResult.data);
            return;
          }
          
          // Unknown message type
          console.warn("[Bio Sentinel] Unknown message format:", rawMessage.type || "no type");
          ws.send(JSON.stringify({
            type: "error",
            timestamp: Date.now(),
            payload: {
              message: "Unknown message format",
              received_type: rawMessage.type,
            },
          }));
        } catch (e) {
          console.error("[Bio Sentinel] Message parse error:", e);
          ws.send(JSON.stringify({
            type: "error",
            timestamp: Date.now(),
            payload: { message: "Invalid JSON" },
          }));
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