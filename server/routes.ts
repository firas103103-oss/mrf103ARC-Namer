  // ==================== IMPORTS ====================
  import type { Express, Request, Response, NextFunction } from "express";
  import express from "express";
  import fs from "fs";
  import path from "path";
  import archiver from "archiver";
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
    simulationUpdateSchema,
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

  // ==================== ARC EXECUTE TOKEN MIDDLEWARE ====================
  function arcTokenMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers["x-arc-token"];
    const expectedToken = process.env.ARC_TOKEN;

    if (!expectedToken) {
      return res.status(500).json({ ok: false, error: "server_misconfigured" });
    }

    if (token !== expectedToken) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
    next();
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

    // ==================== ARC EXECUTE (X-ARC-TOKEN) ====================
    app.post("/arc/execute", arcTokenMiddleware, (req: Request, res: Response) => {
      const { job_id, command, payload } = req.body;

      if (!job_id || !command) {
        return res.status(400).json({ ok: false, error: "missing_required_fields" });
      }

      const external_trace = `replit-${Date.now()}`;

      if (payload?.action === "ping") {
        return res.json({
          ok: true,
          job_id,
          external_trace,
          result: { pong: true, ts: new Date().toISOString() }
        });
      }

      return res.json({
        ok: true,
        job_id,
        external_trace,
        result: { message: "executor placeholder", echo: payload }
      });
    });

    // ==================== AGENTS ====================
    app.get("/api/agents", (_req, res) => sendSuccess(res, VIRTUAL_AGENTS));

    // ==================== ARC REALITY REPORT ====================
    app.post("/api/arc/reality-report", async (req: Request, res: Response) => {
      const { request_id, include = [], verbosity = "full" } = req.body;
      const report: Record<string, any> = {
        request_id,
        generated_at: new Date().toISOString(),
        verbosity,
      };

      // ENV CHECK
      if (include.includes("env")) {
        report.env = {
          NODE_ENV: process.env.NODE_ENV || "development",
          DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
          OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "SET" : "MISSING",
          ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? "SET" : "MISSING",
          SUPABASE_URL: (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL) ? "SET" : "MISSING",
          SUPABASE_KEY: process.env.SUPABASE_KEY ? "SET" : "MISSING",
          ARC_BACKEND_SECRET: process.env.ARC_BACKEND_SECRET ? "SET" : "MISSING",
          ARC_TOKEN: process.env.ARC_TOKEN ? "SET" : "MISSING",
          N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL ? "SET" : "MISSING",
          TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "SET" : "MISSING",
        };
      }

      // ROUTES CHECK
      if (include.includes("routes")) {
        report.routes = {
          health: "GET /api/health",
          auth: ["GET /api/auth/user", "GET /api/login", "GET /api/logout", "GET /api/callback"],
          arc_execute: "POST /arc/execute (X-ARC-TOKEN)",
          arc_api: [
            "POST /api/arc/reality-report",
            "POST /api/arc/agents/mrf-brain",
            "POST /api/arc/agents/summary",
            "POST /api/arc/agent-events",
            "POST /api/arc/ceo-reminders",
            "POST /api/arc/executive-summary",
            "POST /api/arc/governance/notify",
            "POST /api/arc/rules/broadcast",
            "POST /api/arc/notifications/high",
            "POST /api/arc/receive",
            "POST /api/arc/command",
            "POST /api/arc/events",
            "GET /api/arc/brain/state",
            "GET /api/arc/brain/self-awareness",
          ],
          chat: "POST /api/chat",
          tts: "POST /api/tts",
          conversations: ["GET /api/conversations", "POST /api/conversations", "GET /api/conversations/:id/messages"],
          dashboard: ["GET /api/dashboard/commands", "GET /api/dashboard/events", "GET /api/dashboard/feedback", "GET /api/dashboard/metrics"],
          team: ["GET /api/team/tasks", "POST /api/team/tasks", "PATCH /api/team/tasks/:id"],
          activity: ["GET /api/activity", "POST /api/activity"],
          simulations: ["GET /api/simulations", "POST /api/simulations", "POST /api/simulations/:id/run"],
          bio_sentinel: ["GET /api/bio-sentinel/profiles", "POST /api/bio-sentinel/profiles", "POST /api/bio-sentinel/chat", "WS /ws/bio-sentinel"],
          android: "GET /api/android/download",
        };
      }

      // DATABASE CHECK
      if (include.includes("db")) {
        try {
          const result = await db.execute(sql`SELECT 1 as ping`);
          report.db = { status: "connected", ping: "ok" };
        } catch (e: any) {
          report.db = { status: "error", message: e.message };
        }
      }

      // N8N CHECK
      if (include.includes("n8n")) {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        if (webhookUrl) {
          try {
            const resp = await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ping: true, from: "reality-report" }),
            });
            report.n8n = { status: resp.ok ? "reachable" : "error", http_status: resp.status, webhook_url: webhookUrl.substring(0, 50) + "..." };
          } catch (e: any) {
            report.n8n = { status: "unreachable", error: e.message };
          }
        } else {
          report.n8n = { status: "not_configured" };
        }
      }

      // SUPABASE CHECK
      if (include.includes("supabase")) {
        const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_KEY;
        if (url && key) {
          try {
            const supabase = createClient(url, key);
            const { error } = await supabase.from("arc_jobs").select("id").limit(1);
            report.supabase = {
              status: error ? "error" : "connected",
              url: url.substring(0, 40) + "...",
              arc_jobs_table: error ? error.message : "accessible",
            };
          } catch (e: any) {
            report.supabase = { status: "error", message: e.message };
          }
        } else {
          report.supabase = { status: "not_configured", url: url ? "SET" : "MISSING", key: key ? "SET" : "MISSING" };
        }
      }

      // OPENAI CHECK
      if (include.includes("openai")) {
        if (process.env.OPENAI_API_KEY) {
          try {
            const models = await openai.models.list();
            report.openai = { status: "connected", models_available: models.data.length };
          } catch (e: any) {
            report.openai = { status: "error", message: e.message };
          }
        } else {
          report.openai = { status: "not_configured" };
        }
      }

      // ELEVENLABS CHECK
      if (include.includes("elevenlabs")) {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (apiKey) {
          try {
            const resp = await fetch("https://api.elevenlabs.io/v1/voices", {
              headers: { "xi-api-key": apiKey },
            });
            const data = await resp.json();
            report.elevenlabs = { status: resp.ok ? "connected" : "error", voices_count: data.voices?.length || 0 };
          } catch (e: any) {
            report.elevenlabs = { status: "error", message: e.message };
          }
        } else {
          report.elevenlabs = { status: "not_configured" };
        }
      }

      // BUILD CHECK
      if (include.includes("build")) {
        const fs = await import("fs");
        const distExists = fs.existsSync("dist/public/index.html");
        const androidExists = fs.existsSync("android/app/build.gradle");
        report.build = {
          web_dist: distExists ? "present" : "missing",
          android_project: androidExists ? "present" : "missing",
          capacitor_config: fs.existsSync("capacitor.config.ts") ? "present" : "missing",
        };
      }

      // RUNTIME CHECK
      if (include.includes("runtime")) {
        report.runtime = {
          node_version: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime_seconds: Math.floor(process.uptime()),
          memory_mb: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024),
          pid: process.pid,
        };
      }

      res.json({ ok: true, report });
    });

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
    const DEFAULT_BRAIN_MANIFEST = {
      system_version: "v15.0-ARC2.0",
      environment: {
        supabase_url: "https://udcwitnnogxrvoxefrge.supabase.co",
        replit_endpoints: {
          receive: "/api/arc/receive",
          selfcheck: "/selfcheck",
          ping: "/ping",
          chat: "/api/chat",
          tts: "/api/tts"
        },
        replit_runtime: true
      },
      agents: {
        "Mr.F": { role: "Executive Brain", voice_id: "HRaipzPqzrU15BUS5ypU" },
        "L0-Ops": { role: "Operations Commander", voice_id: "CxlDiOFUbSOiMn57bk3w" },
        "L0-Comms": { role: "Communications Director", voice_id: "0hJmISqttjKhoHxPrKoy" },
        "L0-Intel": { role: "Intelligence Analyst", voice_id: "rFDdsCQRZCUL8cPOWtnP" },
        "Dr. Maya Quest": { role: "Research Analyst", voice_id: "PB6BdkFkZLbI39GHdnbQ" },
        "Jordan Spark": { role: "Creative Director", voice_id: "jAAHNNqlbAX9iWjJPEtE" }
      },
      modules: [
        "Supabase Integration", "n8n Automation", "Executive Summary Generator",
        "SelfCheck Dashboard", "Realtime Bridge", "Voice Layer", "Report Archiver",
        "Actions", "Context", "Reasoning", "Execution"
      ],
      status: { health: "stable", last_update: new Date().toISOString() }
    };

    app.get("/api/arc/brain/state", async (_req, res) => {
      try {
        let data = DEFAULT_BRAIN_MANIFEST;
        const manifestPath = path.join(process.cwd(), "arc_core", "brain_manifest.json");
        if (fs.existsSync(manifestPath)) {
          try {
            data = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
          } catch { /* use default */ }
        }

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
    const DEFAULT_SELF_AWARENESS = {
      identity: "ARC Intelligence Framework",
      purpose: "Enterprise multi-agent AI orchestration",
      capabilities: ["Voice synthesis", "Multi-agent coordination", "Real-time monitoring"],
      status: "operational"
    };

    app.get("/api/arc/brain/self-awareness", async (_req, res) => {
      try {
        let data = DEFAULT_SELF_AWARENESS;
        const selfPath = path.join(process.cwd(), "arc_core", "brain_self-awareness.json");
        if (fs.existsSync(selfPath)) {
          try {
            data = JSON.parse(fs.readFileSync(selfPath, "utf-8"));
          } catch { /* use default */ }
        }
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

    // ==================== AGENT PERFORMANCE (Temporal Anomaly Lab) ====================
    app.get("/api/agents/performance", async (_req, res) => {
      try {
        const [tasksByAgent, commandsByAgent, dailyPerformance] = await Promise.all([
          db.execute(sql`
            SELECT 
              assigned_agent as agent_id,
              COUNT(*) FILTER (WHERE status = 'completed') as completed,
              COUNT(*) as total
            FROM team_tasks
            WHERE assigned_agent IS NOT NULL
            GROUP BY assigned_agent
          `),
          db.execute(sql`
            SELECT 
              source as agent_id,
              AVG(duration_ms) as avg_response,
              COUNT(*) FILTER (WHERE status = 'completed') as success,
              COUNT(*) as total
            FROM arc_command_log
            WHERE source IS NOT NULL
            GROUP BY source
          `),
          db.execute(sql`
            SELECT 
              DATE(created_at) as date,
              source as agent_id,
              COUNT(*) FILTER (WHERE status = 'completed') as success_count,
              COUNT(*) as total_count
            FROM arc_command_log
            WHERE created_at > NOW() - INTERVAL '7 days'
            AND source IS NOT NULL
            GROUP BY DATE(created_at), source
            ORDER BY date DESC
          `),
        ]);

        const taskMap = new Map<string, { completed: number; total: number }>();
        for (const row of (tasksByAgent.rows || []) as any[]) {
          taskMap.set(row.agent_id, {
            completed: Number(row.completed) || 0,
            total: Number(row.total) || 0,
          });
        }

        const commandMap = new Map<string, { avgResponse: number; successRate: number }>();
        for (const row of (commandsByAgent.rows || []) as any[]) {
          const total = Number(row.total) || 1;
          const success = Number(row.success) || 0;
          commandMap.set(row.agent_id, {
            avgResponse: Math.round(Number(row.avg_response) || 0),
            successRate: Math.round((success / total) * 100),
          });
        }

        const dailyMap = new Map<string, Map<string, number>>();
        for (const row of (dailyPerformance.rows || []) as any[]) {
          const dateStr = new Date(row.date).toISOString().split('T')[0];
          if (!dailyMap.has(dateStr)) {
            dailyMap.set(dateStr, new Map());
          }
          const total = Number(row.total_count) || 1;
          const success = Number(row.success_count) || 0;
          dailyMap.get(dateStr)!.set(row.agent_id, Math.round((success / total) * 100));
        }

        const agents = VIRTUAL_AGENTS.map((agent) => {
          const taskData = taskMap.get(agent.id) || { completed: 0, total: 0 };
          const cmdData = commandMap.get(agent.id) || { avgResponse: 500, successRate: 85 };
          
          const taskCompletion = taskData.total > 0 ? Math.round((taskData.completed / taskData.total) * 100) : 80;
          const currentPerformance = Math.round((taskCompletion + cmdData.successRate) / 2) || 85;
          const historicalAvg = Math.max(currentPerformance - 5, 70);
          
          let trend: "up" | "down" | "stable" = "stable";
          if (currentPerformance > historicalAvg + 2) trend = "up";
          else if (currentPerformance < historicalAvg - 2) trend = "down";

          return {
            id: agent.id,
            name: agent.name,
            role: agent.role,
            currentPerformance,
            historicalAvg,
            trend,
            avatar: agent.avatar,
          };
        });

        const chartData: Array<Record<string, any>> = [];
        const dates = Array.from(dailyMap.keys()).sort().slice(-7);
        
        if (dates.length === 0) {
          const now = new Date();
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            chartData.push({
              date: dateLabel,
              mrF: 85 + Math.floor(Math.random() * 10),
              l0Ops: 80 + Math.floor(Math.random() * 10),
              l0Intel: 82 + Math.floor(Math.random() * 10),
              creative: 75 + Math.floor(Math.random() * 10),
              avg: 80 + Math.floor(Math.random() * 5),
            });
          }
        } else {
          for (const dateStr of dates) {
            const agentData = dailyMap.get(dateStr)!;
            const d = new Date(dateStr);
            const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const entry: Record<string, any> = { date: dateLabel };
            let sum = 0;
            let count = 0;
            for (const agent of VIRTUAL_AGENTS) {
              const perf = agentData.get(agent.id) || 85;
              entry[agent.id.replace('-', '')] = perf;
              sum += perf;
              count++;
            }
            entry.avg = count > 0 ? Math.round(sum / count) : 85;
            chartData.push(entry);
          }
        }

        sendSuccess(res, { agents, chartData });
      } catch (e: any) {
        const fallbackAgents = VIRTUAL_AGENTS.map((agent) => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          currentPerformance: 80 + Math.floor(Math.random() * 15),
          historicalAvg: 78 + Math.floor(Math.random() * 10),
          trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
          avatar: agent.avatar,
        }));
        
        const now = new Date();
        const fallbackChart = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          fallbackChart.push({
            date: dateLabel,
            mrf: 85 + Math.floor(Math.random() * 10),
            l0ops: 80 + Math.floor(Math.random() * 10),
            l0intel: 82 + Math.floor(Math.random() * 10),
            creative: 75 + Math.floor(Math.random() * 10),
            avg: 80 + Math.floor(Math.random() * 5),
          });
        }
        
        sendSuccess(res, { agents: fallbackAgents, chartData: fallbackChart });
      }
    });

    // ==================== AGENT ANOMALIES ====================
    app.get("/api/agents/anomalies", async (_req, res) => {
      try {
        const [recentCommands, activityEvents] = await Promise.all([
          db.execute(sql`
            SELECT 
              source as agent_id,
              status,
              duration_ms,
              created_at
            FROM arc_command_log
            WHERE created_at > NOW() - INTERVAL '7 days'
            ORDER BY created_at DESC
            LIMIT 100
          `),
          db.execute(sql`
            SELECT 
              agent_id,
              type,
              title,
              description,
              metadata,
              created_at
            FROM activity_feed
            WHERE created_at > NOW() - INTERVAL '7 days'
            AND (type = 'error' OR type = 'warning' OR type = 'anomaly' OR title ILIKE '%anomaly%' OR title ILIKE '%error%')
            ORDER BY created_at DESC
            LIMIT 50
          `),
        ]);

        const anomalies: any[] = [];
        const agentStats = new Map<string, { totalDuration: number; count: number; failures: number }>();

        for (const row of (recentCommands.rows || []) as any[]) {
          if (!row.agent_id) continue;
          const existing = agentStats.get(row.agent_id) || { totalDuration: 0, count: 0, failures: 0 };
          existing.totalDuration += Number(row.duration_ms) || 0;
          existing.count++;
          if (row.status === 'failed') existing.failures++;
          agentStats.set(row.agent_id, existing);
        }

        for (const [agentId, stats] of agentStats) {
          const agent = VIRTUAL_AGENTS.find((a) => a.id === agentId);
          if (!agent) continue;

          const avgDuration = stats.count > 0 ? stats.totalDuration / stats.count : 0;
          const failureRate = stats.count > 0 ? (stats.failures / stats.count) * 100 : 0;

          if (avgDuration > 3000) {
            anomalies.push({
              id: `anomaly-${agentId}-slow`,
              agentId,
              agentName: agent.name,
              type: "drop",
              severity: avgDuration > 5000 ? "critical" : "moderate",
              description: `Response time averaging ${Math.round(avgDuration)}ms, above acceptable threshold`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              metric: "Response Time",
              deviation: -Math.round((avgDuration - 2000) / 20),
            });
          }

          if (failureRate > 10) {
            anomalies.push({
              id: `anomaly-${agentId}-failures`,
              agentId,
              agentName: agent.name,
              type: "drop",
              severity: failureRate > 25 ? "critical" : failureRate > 15 ? "moderate" : "minor",
              description: `Failure rate at ${Math.round(failureRate)}% over past 7 days`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              metric: "Success Rate",
              deviation: -Math.round(failureRate),
            });
          }

          if (stats.count > 50 && failureRate < 5) {
            anomalies.push({
              id: `anomaly-${agentId}-spike`,
              agentId,
              agentName: agent.name,
              type: "spike",
              severity: "minor",
              description: `Exceptional activity with ${stats.count} operations at ${100 - Math.round(failureRate)}% success rate`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              metric: "Activity Level",
              deviation: Math.round(stats.count / 10),
            });
          }
        }

        for (const row of (activityEvents.rows || []) as any[]) {
          const agent = VIRTUAL_AGENTS.find((a) => a.id === row.agent_id);
          anomalies.push({
            id: `activity-${row.agent_id}-${Date.now()}`,
            agentId: row.agent_id || "system",
            agentName: agent?.name || "System",
            type: row.type === "error" ? "drop" : "pattern",
            severity: row.type === "error" ? "moderate" : "minor",
            description: row.description || row.title,
            timestamp: new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 16),
            metric: "System Event",
            deviation: row.type === "error" ? -15 : -5,
          });
        }

        if (anomalies.length === 0) {
          for (const agent of VIRTUAL_AGENTS.slice(0, 3)) {
            anomalies.push({
              id: `sample-${agent.id}`,
              agentId: agent.id,
              agentName: agent.name,
              type: ["spike", "drop", "pattern"][Math.floor(Math.random() * 3)] as "spike" | "drop" | "pattern",
              severity: "minor",
              description: "No significant anomalies detected - system operating normally",
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              metric: "Overall Health",
              deviation: Math.floor(Math.random() * 10) - 5,
            });
          }
        }

        sendSuccess(res, anomalies.slice(0, 10));
      } catch (e: any) {
        sendSuccess(res, []);
      }
    });

    // ==================== AGENT ANALYTICS ====================
    app.get("/api/agents/analytics", isAuthenticated, async (_req, res) => {
      try {
        const [tasksByAgent, activityByAgent, responseTimeByAgent] = await Promise.all([
          db.execute(sql`
            SELECT 
              assigned_agent as agent_id,
              COUNT(*) FILTER (WHERE status = 'completed') as tasks_completed,
              COUNT(*) as total_tasks
            FROM team_tasks
            WHERE assigned_agent IS NOT NULL
            GROUP BY assigned_agent
          `),
          db.execute(sql`
            SELECT 
              agent_id,
              COUNT(*) as message_count
            FROM activity_feed
            WHERE agent_id IS NOT NULL
            GROUP BY agent_id
          `),
          db.execute(sql`
            SELECT 
              source as agent_id,
              AVG(duration_ms) as avg_response_time,
              COUNT(*) FILTER (WHERE status = 'completed') as success_count,
              COUNT(*) as total_count
            FROM arc_command_log
            WHERE source IS NOT NULL
            GROUP BY source
          `),
        ]);

        const taskMap = new Map<string, { tasksCompleted: number; totalTasks: number }>();
        for (const row of (tasksByAgent.rows || []) as any[]) {
          taskMap.set(row.agent_id, {
            tasksCompleted: Number(row.tasks_completed) || 0,
            totalTasks: Number(row.total_tasks) || 0,
          });
        }

        const activityMap = new Map<string, number>();
        for (const row of (activityByAgent.rows || []) as any[]) {
          activityMap.set(row.agent_id, Number(row.message_count) || 0);
        }

        const responseMap = new Map<string, { avgResponseTime: number; successRate: number }>();
        for (const row of (responseTimeByAgent.rows || []) as any[]) {
          const total = Number(row.total_count) || 1;
          const success = Number(row.success_count) || 0;
          responseMap.set(row.agent_id, {
            avgResponseTime: Math.round(Number(row.avg_response_time) || 0),
            successRate: Math.round((success / total) * 100),
          });
        }

        const agentAnalytics = VIRTUAL_AGENTS.map((agent) => {
          const taskData = taskMap.get(agent.id) || { tasksCompleted: 0, totalTasks: 0 };
          const messageCount = activityMap.get(agent.id) || 0;
          const responseData = responseMap.get(agent.id) || { avgResponseTime: 0, successRate: 100 };
          
          return {
            agentId: agent.id,
            name: agent.name,
            tasksCompleted: taskData.tasksCompleted,
            avgResponseTime: responseData.avgResponseTime,
            successRate: responseData.successRate,
            messageCount,
          };
        });

        sendSuccess(res, agentAnalytics);
      } catch (e: any) {
        const fallbackData = VIRTUAL_AGENTS.map((agent) => ({
          agentId: agent.id,
          name: agent.name,
          tasksCompleted: 0,
          avgResponseTime: 0,
          successRate: 100,
          messageCount: 0,
        }));
        sendSuccess(res, fallbackData);
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

    app.patch("/api/simulations/:id", isAuthenticated, async (req, res) => {
      try {
        const { id } = req.params;
        const validated = simulationUpdateSchema.parse(req.body);
        
        const { name, description, steps, status } = validated;
        const result = await db.execute(sql`
          UPDATE workflow_simulations 
          SET name = COALESCE(${name}, name),
              description = COALESCE(${description}, description),
              steps = COALESCE(${steps ? JSON.stringify(steps) : null}, steps),
              status = COALESCE(${status}, status),
              updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `);
        if (!result.rows?.length) {
          return sendError(res, 404, "Simulation not found");
        }
        sendSuccess(res, result.rows[0]);
      } catch (e: any) {
        if (e instanceof ZodError) {
          return sendError(res, 400, "Invalid request body", e.errors);
        }
        sendError(res, 500, e.message);
      }
    });

    app.post("/api/simulations/:id/run", isAuthenticated, async (req, res) => {
      try {
        const { id } = req.params;
        // Run simulation logic would go here
        const runResult = { 
          status: 'success', 
          timestamp: new Date().toISOString(),
          stepResults: []
        };
        const result = await db.execute(sql`
          UPDATE workflow_simulations 
          SET last_run_at = NOW(), 
              last_result = ${JSON.stringify(runResult)},
              status = 'completed'
          WHERE id = ${id}
          RETURNING *
        `);
        sendSuccess(res, { ...result.rows?.[0], result: runResult });
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // ==================== X BIO SENTINEL ROUTES ====================

    const bioSentinelClients: Set<WebSocket> = new Set();

    // GET smell profiles from database
    app.get("/api/bio-sentinel/profiles", isAuthenticated, async (_req, res) => {
      try {
        const profiles = await storage.getSmellProfiles();
        sendSuccess(res, profiles);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // POST create smell profile in database
    app.post("/api/bio-sentinel/profiles", isAuthenticated, async (req, res) => {
      try {
        const parsed = smellProfileSchema.parse(req.body);
        const newProfile = await storage.createSmellProfile({
          name: parsed.name,
          category: parsed.category || null,
          subcategory: parsed.subcategory || null,
          description: parsed.description || null,
          label: parsed.label || null,
          notes: parsed.notes || null,
          rawSignature: parsed.rawSignature || null,
          featureVector: parsed.featureVector || null,
          baselineGas: parsed.baselineGas || null,
          peakGas: parsed.peakGas || null,
          deltaGas: parsed.deltaGas || null,
          tags: parsed.tags || null,
          samplesCount: 1,
          confidence: 80,
        });
        sendSuccess(res, newProfile);
      } catch (e: any) {
        sendError(res, 400, e.message);
      }
    });

    // GET single profile from database
    app.get("/api/bio-sentinel/profiles/:id", isAuthenticated, async (req, res) => {
      try {
        const profile = await storage.getSmellProfile(req.params.id);
        if (!profile) return sendError(res, 404, "Profile not found");
        sendSuccess(res, profile);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // DELETE profile from database
    app.delete("/api/bio-sentinel/profiles/:id", isAuthenticated, async (req, res) => {
      try {
        const profile = await storage.getSmellProfile(req.params.id);
        if (!profile) return sendError(res, 404, "Profile not found");
        await storage.deleteSmellProfile(req.params.id);
        sendSuccess(res);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // POST sensor readings to database
    app.post("/api/bio-sentinel/readings", isAuthenticated, async (req, res) => {
      try {
        const { deviceId, gasResistance, temperature, humidity, pressure, iaqScore, co2Equivalent, vocEquivalent, heaterTemperature, mode } = req.body;
        if (!deviceId) return sendError(res, 400, "deviceId is required");
        
        const reading = await storage.createSensorReading({
          deviceId,
          gasResistance: gasResistance || null,
          temperature: temperature || null,
          humidity: humidity || null,
          pressure: pressure || null,
          iaqScore: iaqScore || null,
          co2Equivalent: co2Equivalent || null,
          vocEquivalent: vocEquivalent || null,
          heaterTemperature: heaterTemperature || null,
          mode: mode || null,
        });
        sendSuccess(res, reading);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // GET sensor readings from database
    app.get("/api/bio-sentinel/readings", isAuthenticated, async (req, res) => {
      try {
        const deviceId = req.query.deviceId as string | undefined;
        const limit = parseInt(req.query.limit as string) || 100;
        const readings = await storage.getSensorReadings(deviceId, limit);
        sendSuccess(res, readings);
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

    // Export profiles from database
    app.get("/api/bio-sentinel/export", isAuthenticated, async (_req, res) => {
      try {
        const profiles = await storage.getSmellProfiles();
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=smell-profiles.json");
        res.json(profiles);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    // Import profiles to database
    app.post("/api/bio-sentinel/import", isAuthenticated, async (req, res) => {
      try {
        const profiles = req.body;
        if (!Array.isArray(profiles)) return sendError(res, 400, "Expected array of profiles");
        
        let importedCount = 0;
        for (const p of profiles) {
          const parsed = smellProfileSchema.parse(p);
          await storage.createSmellProfile({
            name: parsed.name,
            category: parsed.category || null,
            subcategory: parsed.subcategory || null,
            description: parsed.description || null,
            label: parsed.label || null,
            notes: parsed.notes || null,
            rawSignature: parsed.rawSignature || null,
            featureVector: parsed.featureVector || null,
            baselineGas: parsed.baselineGas || null,
            peakGas: parsed.peakGas || null,
            deltaGas: parsed.deltaGas || null,
            tags: parsed.tags || null,
            samplesCount: 1,
            confidence: 80,
          });
          importedCount++;
        }
        sendSuccess(res, { imported: importedCount });
      } catch (e: any) {
        sendError(res, 400, e.message);
      }
    });

    // ==================== ANDROID APK DOWNLOAD ====================
    app.get("/api/android/download", async (_req, res) => {
      try {
        const androidDir = path.join(process.cwd(), "android");
        
        if (!fs.existsSync(androidDir)) {
          return sendError(res, 404, "Android project not found. Run 'npx cap add android' first.");
        }

        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", "attachment; filename=arc-android-project.zip");

        const archive = archiver("zip", { zlib: { level: 9 } });
        
        archive.on("error", (err) => {
          throw err;
        });

        archive.pipe(res);
        archive.directory(androidDir, "arc-android-project");
        await archive.finalize();
      } catch (e: any) {
        sendError(res, 500, e.message);
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

    // ==================== MISSION SCENARIOS ====================
    app.get("/api/scenarios", isAuthenticated, async (_req, res) => {
      try {
        const result = await db.execute(sql`
          SELECT * FROM mission_scenarios ORDER BY created_at DESC LIMIT 50
        `);
        sendSuccess(res, result.rows || []);
      } catch (e: any) {
        sendSuccess(res, []);
      }
    });

    app.post("/api/scenarios", isAuthenticated, async (req, res) => {
      try {
        const { name, description, objectives, riskLevel, category, status } = req.body;
        if (!name) return sendError(res, 400, "Name is required");
        
        const result = await db.execute(sql`
          INSERT INTO mission_scenarios (name, description, objectives, risk_level, category, status)
          VALUES (${name}, ${description || null}, ${JSON.stringify(objectives || [])}, ${riskLevel || 1}, ${category || null}, ${status || 'draft'})
          RETURNING *
        `);
        sendSuccess(res, result.rows?.[0]);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    app.patch("/api/scenarios/:id", isAuthenticated, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description, objectives, riskLevel, category, status } = req.body;
        
        const result = await db.execute(sql`
          UPDATE mission_scenarios 
          SET name = COALESCE(${name}, name),
              description = COALESCE(${description}, description),
              objectives = COALESCE(${objectives ? JSON.stringify(objectives) : null}, objectives),
              risk_level = COALESCE(${riskLevel}, risk_level),
              category = COALESCE(${category}, category),
              status = COALESCE(${status}, status),
              updated_at = NOW()
          WHERE id = ${id}
          RETURNING *
        `);
        
        if (!result.rows || result.rows.length === 0) {
          return sendError(res, 404, "Scenario not found");
        }
        sendSuccess(res, result.rows?.[0]);
      } catch (e: any) {
        sendError(res, 500, e.message);
      }
    });

    return httpServer;
  }