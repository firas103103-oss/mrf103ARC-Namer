
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { supabase, isSupabaseConfigured } from "./supabase";

function getClientIp(req: any): string {
  const xff = req.headers?.["x-forwarded-for"]; 
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function createRateLimiter(options: { windowMs: number; max: number }) {
  const hits = new Map<string, { resetAt: number; count: number }>();

  return (req: any, res: any, next: any) => {
    const now = Date.now();
    const key = `${req.path}:${getClientIp(req)}`;
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { resetAt: now + options.windowMs, count: 1 });
      return next();
    }

    entry.count += 1;
    if (entry.count > options.max) {
      return res.status(429).json({ error: "rate_limited" });
    }

    return next();
  };
}

function requireOperatorSession(req: any, res: any, next: any) {
  if (req.session?.operatorAuthenticated) return next();
  return res.status(401).json({ error: "unauthorized" });
}

const operatorLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });

function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out: any = {};
  for (const key of keys) out[key] = obj?.[key];
  return out;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // --- KAYAN NEURAL BRIDGE (Webhook for n8n) ---
  app.post("/api/execute", async (req, res) => {
    try {
      const { command, payload } = req.body;
      console.log(`[KAYAN BRIDGE] Command Received: ${command}`, payload);

      // Logic Switch: Handle incoming n8n commands
      let result = { status: "ignored", message: "No logic defined for this command" };
      
      if (command === "create_project") {
        // Example: logic to insert into DB
        // const newProject = await storage.createProject(payload);
        result = { status: "success", message: "Project creation logic triggered" };
      }

      res.json({ success: true, timestamp: new Date(), result });
    } catch (error) {
      console.error("[KAYAN BRIDGE] Error:", error);
      res.status(500).json({ success: false, error: "Bridge Collapse" });
    }
  });
  // ---------------------------------------------

  // Put your application routes here
  // Example: api/projects, api/users etc.
  
  app.get("/api/health", (req, res) => {
    res.json({ status: "System Online", mode: "Horizontal Integration" });
  });

  // --- Minimal operator auth (server-side session cookie) ---
  app.get("/api/auth/user", (req: any, res) => {
    if (!req.session?.operatorAuthenticated) return res.status(401).json({ error: "unauthorized" });
    res.json({ id: "operator", email: "operator@local", firstName: "Mr.", lastName: "F" });
  });

  app.post("/api/auth/login", operatorLimiter, async (req: any, res) => {
    const expected = process.env.ARC_OPERATOR_PASSWORD || process.env.ARC_BACKEND_SECRET;
    if (!expected) {
      return res.status(500).json({ error: "missing_server_auth_secret" });
    }

    const { password } = req.body || {};
    if (typeof password !== "string" || password.length === 0 || password !== expected) {
      return res.status(401).json({ error: "invalid_credentials" });
    }

    req.session.operatorAuthenticated = true;
    res.json({ ok: true });
  });

  app.post("/api/auth/logout", operatorLimiter, (req: any, res) => {
    req.session?.destroy(() => {
      res.json({ ok: true });
    });
  });

  // Back-compat for existing UI buttons
  app.post("/api/login", (req, res) => res.redirect(307, "/api/auth/login"));
  app.get("/api/logout", (req: any, res) => {
    req.session?.destroy(() => {
      res.redirect("/");
    });
  });

  // --- Secured data APIs (no direct Supabase from browser) ---
  app.get("/api/arc/command-log", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await supabase
      .from("arc_command_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) return res.status(500).json({ error: "supabase_query_failed" });

    const whitelisted = (data || []).map((row: any) =>
      pick(row, ["id", "command_id", "command", "status", "created_at", "payload", "duration_ms"] as any),
    );
    res.json({ data: whitelisted, count: count ?? 0 });
  });

  app.get("/api/arc/agent-events", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await supabase
      .from("agent_events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) return res.status(500).json({ error: "supabase_query_failed" });

    const whitelisted = (data || []).map((row: any) =>
      pick(row, ["id", "agent_name", "event_type", "payload", "created_at"] as any),
    );
    res.json({ data: whitelisted, count: count ?? 0 });
  });

  app.get("/api/arc/command-metrics", operatorLimiter, requireOperatorSession, async (_req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });

    const { data, error } = await supabase
      .from("arc_command_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return res.status(500).json({ error: "supabase_query_failed" });

    const commands = data || [];
    const total = commands.length;
    const success = commands.filter((c: any) => String(c.status).toLowerCase() === "completed").length;
    const failed = commands.filter((c: any) => String(c.status).toLowerCase() === "failed").length;
    const avgResponse =
      commands.reduce((acc: number, c: any) => acc + (Number(c.duration_ms) || 0), 0) / (total || 1);

    res.json({ total, success, failed, avgResponse });
  });

  app.get("/api/arc/selfcheck", operatorLimiter, requireOperatorSession, async (_req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });

    const [reminders, summaries, events] = await Promise.all([
      supabase.from("ceo_reminders").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("executive_summaries").select("*").order("generated_at", { ascending: false }).limit(200),
      supabase.from("agent_events").select("*").order("created_at", { ascending: false }).limit(200),
    ]);

    if (reminders.error || summaries.error || events.error) {
      return res.status(500).json({ error: "supabase_query_failed" });
    }

    const remindersOut = (reminders.data || []).map((row: any) =>
      pick(row, ["id", "title", "due_date", "priority", "created_at"] as any),
    );
    const summariesOut = (summaries.data || []).map((row: any) =>
      pick(row, ["id", "summary_text", "generated_at", "sentiment"] as any),
    );
    const eventsOut = (events.data || []).map((row: any) =>
      pick(row, ["id", "agent_name", "event_type", "payload", "created_at"] as any),
    );

    res.json({ reminders: remindersOut, summaries: summariesOut, events: eventsOut });
  });

  // --- Dashboard API (thin wrappers/aggregators) ---
  
  // GET /api/dashboard/commands (reuse command-log logic)
  app.get("/api/dashboard/commands", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await supabase
      .from("arc_command_log")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) return res.status(500).json({ error: "supabase_query_failed" });

    const whitelisted = (data || []).map((row: any) =>
      pick(row, ["id", "command_id", "command", "status", "created_at", "payload", "duration_ms"] as any),
    );
    res.json({ data: whitelisted, count: count ?? 0 });
  });

  // GET /api/dashboard/events (reuse agent-events logic)
  app.get("/api/dashboard/events", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await supabase
      .from("agent_events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) return res.status(500).json({ error: "supabase_query_failed" });

    const whitelisted = (data || []).map((row: any) =>
      pick(row, ["id", "agent_name", "event_type", "payload", "created_at"] as any),
    );
    res.json({ data: whitelisted, count: count ?? 0 });
  });

  // GET /api/dashboard/feedback (STUB: UI compatibility placeholder)
  // NOTE: Returns empty array. Actual feedback/callback storage endpoint not yet defined.
  app.get("/api/dashboard/feedback", operatorLimiter, requireOperatorSession, (_req: any, res) => {
    res.json({ data: [], count: 0 });
  });

  // GET /api/core/timeline (aggregate command-log + agent-events, merged and sorted)
  app.get("/api/core/timeline", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });

    // Fetch last 100 commands and events
    const [cmdRes, evtRes] = await Promise.all([
      supabase.from("arc_command_log").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("agent_events").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

    if (cmdRes.error || evtRes.error) {
      return res.status(500).json({ error: "supabase_query_failed" });
    }

    // Whitelisted command logs
    const commands = (cmdRes.data || []).map((row: any) =>
      pick(row, ["id", "command_id", "command", "status", "created_at", "payload", "duration_ms"] as any),
    );

    // Whitelisted agent events
    const events = (evtRes.data || []).map((row: any) =>
      pick(row, ["id", "agent_name", "event_type", "payload", "created_at"] as any),
    );

    // Merge and sort by created_at descending
    const merged = [
      ...commands.map((c: any) => ({ ...c, type: "command" })),
      ...events.map((e: any) => ({ ...e, type: "event" })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({ data: merged, count: merged.length });
  });

  // POST /api/call_mrf_brain (thin proxy to OpenAI handler)
  app.post("/api/call_mrf_brain", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    const { text } = req.body || {};
    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "missing_or_empty_text" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Offline response (no OpenAI key)
      return res.json({ 
        reply: `Mr.F (offline): I received: "${text.trim()}"`, 
        offline: true 
      });
    }

    try {
      const client = new OpenAI({ apiKey });
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

      const completion = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "You are Mr.F, a single-operator ARC assistant. Respond concisely and clearly. Text-only.",
          },
          { role: "user", content: text },
        ],
      });

      const reply = completion.choices?.[0]?.message?.content || "(no response)";
      res.json({ reply: reply.trim(), offline: false });
    } catch (error: any) {
      console.error("[Mr.F Brain] OpenAI error:", error);
      res.status(500).json({ error: "openai_request_failed" });
    }
  });

  // ==========================================
  // Live System APIs - Real Data Endpoints
  // ==========================================

  // 1. Anomalies API
  app.get("/api/agents/anomalies", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });
    
    const timeRange = req.query.timeRange || '7d';
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from("anomalies")
      .select("*")
      .gte("detected_at", since)
      .order("detected_at", { ascending: false });
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  // 2. Mission Scenarios API - GET
  app.get("/api/scenarios", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });
    
    const { data, error } = await supabase
      .from("mission_scenarios")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  // 3. Mission Scenarios API - POST
  app.post("/api/scenarios", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });
    
    const { title, description, category, riskLevel, objectives, assignedAgents } = req.body;
    
    if (!title) return res.status(400).json({ error: "title_required" });
    
    const { data, error } = await supabase
      .from("mission_scenarios")
      .insert([{
        title,
        description: description || null,
        category: category || 'Intelligence',
        risk_level: riskLevel || 50,
        objectives: objectives || [],
        assigned_agents: assignedAgents || []
      }])
      .select()
      .single();
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // 4. Team Tasks API - GET
  app.get("/api/team/tasks", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });
    
    const { data, error } = await supabase
      .from("team_tasks")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  });

  // 5. Team Tasks API - POST
  app.post("/api/team/tasks", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });
    
    const { title, description, assignedAgent, priority, tags } = req.body;
    
    if (!title) return res.status(400).json({ error: "title_required" });
    
    const { data, error } = await supabase
      .from("team_tasks")
      .insert([{
        title,
        description: description || null,
        assigned_agent: assignedAgent || null,
        priority: priority || 'medium',
        tags: tags || []
      }])
      .select()
      .single();
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // 6. Team Tasks API - PATCH (Update)
  app.patch("/api/team/tasks/:id", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });
    
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from("team_tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
      
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // 7. Agent Analytics API
  app.get("/api/agents/analytics", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });
    
    // Fetch recent interactions per agent
    const { data: interactions, error } = await supabase
      .from("agent_interactions")
      .select("agent_id, created_at, duration_ms, success")
      .order("created_at", { ascending: false })
      .limit(1000);
      
    if (error) return res.status(500).json({ error: error.message });
    
    // Group by agent
    const agentStats: Record<string, any> = {};
    (interactions || []).forEach((int: any) => {
      if (!agentStats[int.agent_id]) {
        agentStats[int.agent_id] = {
          id: int.agent_id,
          total: 0,
          successful: 0,
          avgResponseTime: 0,
          totalTime: 0
        };
      }
      agentStats[int.agent_id].total++;
      if (int.success) agentStats[int.agent_id].successful++;
      agentStats[int.agent_id].totalTime += int.duration_ms || 0;
    });
    
    const result = Object.values(agentStats).map((stats: any) => ({
      ...stats,
      successRate: stats.total > 0 ? (stats.successful / stats.total) * 100 : 0,
      avgResponseTime: stats.total > 0 ? stats.totalTime / stats.total : 0
    }));
    
    res.json(result);
  });

  // 8. Agent Performance Metrics API
  app.get("/api/agents/performance", operatorLimiter, requireOperatorSession, async (req: any, res) => {
    if (!isSupabaseConfigured() || !supabase) return res.status(503).json({ error: "supabase_not_configured" });
    
    const timeRange = req.query.timeRange || '7d';
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: metrics, error: metricsError } = await supabase
      .from("agent_performance")
      .select("*")
      .gte("timestamp", since)
      .order("timestamp", { ascending: false });
      
    const { data: interactions, error: intError } = await supabase
      .from("agent_interactions")
      .select("agent_id, success, duration_ms, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false });
      
    if (metricsError || intError) {
      return res.status(500).json({ error: metricsError?.message || intError?.message });
    }
    
    // Aggregate by agent
    const agentData: Record<string, any> = {};
    (interactions || []).forEach((int: any) => {
      if (!agentData[int.agent_id]) {
        agentData[int.agent_id] = {
          id: int.agent_id,
          calls: 0,
          successRate: 0,
          avgLatency: 0,
          totalDuration: 0,
          successful: 0
        };
      }
      agentData[int.agent_id].calls++;
      agentData[int.agent_id].totalDuration += int.duration_ms || 0;
      if (int.success) agentData[int.agent_id].successful++;
    });
    
    const agents = Object.values(agentData).map((a: any) => ({
      ...a,
      successRate: a.calls > 0 ? (a.successful / a.calls) * 100 : 0,
      avgLatency: a.calls > 0 ? a.totalDuration / a.calls : 0
    }));
    
    // Create chart data
    const chartData = (interactions || [])
      .slice(0, 50)
      .reverse()
      .map((int: any) => ({
        timestamp: new Date(int.created_at).toISOString(),
        [int.agent_id]: int.duration_ms || 0
      }));
    
    res.json({ agents, chartData, metrics: metrics || [] });
  });

  const httpServer = createServer(app);
  return httpServer;
}
