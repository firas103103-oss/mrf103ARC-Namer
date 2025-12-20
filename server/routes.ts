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
    VIRTUAL_AGENTS,
    type ExecutiveSummaryResponse,
    type ApiSuccessResponse,
    type ApiErrorResponse,
    type AgentType,
    type ChatMessage,
  } from "@shared/schema";
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
          const conv = await storage.createConversation({ title: parsed.message }, userId);
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

    return httpServer;
  }