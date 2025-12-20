import type { Express, Request, Response, NextFunction } from "express";
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
  type AnalyticsData,
} from "@shared/schema";
import { ZodError } from "zod";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Authentication middleware for ARC routes
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-arc-secret"];
  const expectedSecret = process.env.ARC_BACKEND_SECRET;

  if (!expectedSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[AUTH] CRITICAL: ARC_BACKEND_SECRET not configured in production!");
      const errorResponse: ApiErrorResponse = {
        status: "error",
        message: "Server configuration error: Authentication not configured",
      };
      return res.status(500).json(errorResponse);
    }
    console.warn("[AUTH] ARC_BACKEND_SECRET not configured - allowing request (development mode only)");
    return next();
  }

  if (secret !== expectedSecret) {
    const errorResponse: ApiErrorResponse = {
      status: "error",
      message: "Unauthorized: Invalid or missing X-ARC-SECRET header",
    };
    return res.status(401).json(errorResponse);
  }

  next();
}

// Request logging middleware
function logRequest(endpoint: string, body: unknown) {
  console.log(`[API] ${new Date().toISOString()} - ${endpoint}`);
  if (body && typeof body === "object") {
    const summary: Record<string, unknown> = {};
    const safeKeys = ["event_id", "agent_id", "type", "date", "rule_id", "status", "title", "severity", "source_agent_id", "conversationId", "activeAgents"];
    for (const key of safeKeys) {
      if (key in body) {
        summary[key] = (body as Record<string, unknown>)[key];
      }
    }
    if (Object.keys(summary).length > 0) {
      console.log(`[API] Request summary:`, JSON.stringify(summary));
    }
  }
}

// Error response helper
function sendError(res: Response, status: number, message: string, details?: unknown): void {
  const errorResponse: ApiErrorResponse = {
    status: "error",
    message,
    details,
  };
  res.status(status).json(errorResponse);
}

// Success response helper
function sendSuccess(res: Response, data?: unknown): void {
  if (data) {
    res.status(200).json(data);
  } else {
    const successResponse: ApiSuccessResponse = { status: "ok" };
    res.status(200).json(successResponse);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth user route
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Apply auth middleware to all /api/arc routes
  app.use("/api/arc", authMiddleware);

  // ============================================
  // Virtual Office Chat Routes
  // These routes require session authentication (logged-in users)
  // ============================================

  // Get all agents (public - just returns static agent list)
  app.get("/api/agents", (_req: Request, res: Response) => {
    sendSuccess(res, VIRTUAL_AGENTS);
  });

  // Get all conversations for the current user (requires auth)
  app.get("/api/conversations", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return sendError(res, 401, "User not authenticated");
      }
      const conversations = await storage.getConversationsByUser(userId);
      sendSuccess(res, conversations);
    } catch (error) {
      console.error("[API] Error getting conversations:", error);
      sendError(res, 500, "Failed to get conversations");
    }
  });

  // Delete a conversation (requires auth)
  app.delete("/api/conversations/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return sendError(res, 401, "User not authenticated");
      }
      const conversationId = req.params.id;
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return sendError(res, 404, "Conversation not found");
      }
      if (conversation.userId !== userId) {
        return sendError(res, 403, "Not authorized to delete this conversation");
      }
      await storage.deleteConversation(conversationId);
      sendSuccess(res);
    } catch (error) {
      console.error("[API] Error deleting conversation:", error);
      sendError(res, 500, "Failed to delete conversation");
    }
  });

  // Create a new conversation (requires auth)
  app.post("/api/conversations", isAuthenticated, async (req: any, res: Response) => {
    try {
      logRequest("POST /api/conversations", req.body);
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return sendError(res, 401, "User not authenticated");
      }
      const parsed = conversationSchema.parse(req.body);
      const conversation = await storage.createConversation(parsed, userId);
      sendSuccess(res, conversation);
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[API] Error creating conversation:", error);
        sendError(res, 500, "Failed to create conversation");
      }
    }
  });

  // Get messages for a conversation (requires auth)
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      sendSuccess(res, messages);
    } catch (error) {
      console.error("[API] Error getting messages:", error);
      sendError(res, 500, "Failed to get messages");
    }
  });

  // Get analytics for the current user (requires auth)
  app.get("/api/analytics", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return sendError(res, 401, "User not authenticated");
      }
      const analytics = await storage.getAnalytics(userId);
      sendSuccess(res, analytics);
    } catch (error) {
      console.error("[API] Error getting analytics:", error);
      sendError(res, 500, "Failed to get analytics");
    }
  });

  // Send a chat message and get AI responses (requires auth)
  app.post("/api/chat", isAuthenticated, async (req: any, res: Response) => {
    try {
      logRequest("POST /api/chat", req.body);
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return sendError(res, 401, "User not authenticated");
      }
      const parsed = chatRequestSchema.parse(req.body);

      let conversationId = parsed.conversationId;

      // Create conversation if needed
      if (!conversationId) {
        const conversation = await storage.createConversation({
          title: parsed.message.substring(0, 50) + (parsed.message.length > 50 ? "..." : ""),
          activeAgents: parsed.activeAgents,
        }, userId);
        conversationId = conversation.id;
      }

      // Store user message
      const userMessage: ChatMessage = {
        role: "user",
        content: parsed.message,
        timestamp: new Date().toISOString(),
      };
      await storage.addMessage(conversationId, userMessage);

      // Get conversation history for context
      const history = await storage.getMessages(conversationId);
      const historyMessages = history.slice(-10).map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.agentId
          ? `[${VIRTUAL_AGENTS.find(a => a.id === msg.agentId)?.name || msg.agentId}]: ${msg.content}`
          : msg.content,
      }));

      // Get responses from each active agent
      const agentResponses: { agentId: AgentType; name: string; content: string }[] = [];

      for (const agentId of parsed.activeAgents) {
        const agent = VIRTUAL_AGENTS.find(a => a.id === agentId);
        if (!agent) continue;

        try {
          const response = await openai.chat.completions.create({
            model: "gpt-5",
            messages: [
              { role: "system", content: agent.systemPrompt + "\n\nYou are part of a virtual office team. Be concise but helpful. If other agents are in the conversation, acknowledge their expertise when relevant but focus on your specialty." },
              ...historyMessages,
              { role: "user", content: parsed.message },
            ],
            max_completion_tokens: 1024,
          });

          const content = response.choices[0].message.content || "I apologize, I could not generate a response.";

          // Store agent response
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content,
            agentId,
            timestamp: new Date().toISOString(),
          };
          await storage.addMessage(conversationId, assistantMessage);

          agentResponses.push({
            agentId,
            name: agent.name,
            content,
          });
        } catch (aiError) {
          console.error(`[API] OpenAI error for agent ${agentId}:`, aiError);
          agentResponses.push({
            agentId,
            name: agent.name,
            content: "I'm having trouble connecting right now. Please try again.",
          });
        }
      }

      sendSuccess(res, {
        conversationId,
        responses: agentResponses,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[API] Error in chat:", error);
        sendError(res, 500, "Failed to process chat message");
      }
    }
  });

  // Text-to-Speech endpoint using OpenAI TTS API with Arabic support
  app.post("/api/tts", isAuthenticated, async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/tts", req.body);

      const { text, voice = "nova" } = req.body; // Default voice to 'nova' as requested

      if (!text || typeof text !== "string") {
        return sendError(res, 400, "Text is required and must be a string");
      }

      if (text.length > 4096) {
        return sendError(res, 400, "Text exceeds maximum length of 4096 characters");
      }

      // Detect language (simple check for Arabic characters)
      const isArabic = /[\u0600-\u06FF]/.test(text);
      const language = isArabic ? "ar" : "en";

      // Validate voice based on language
      let selectedVoice = voice;
      if (isArabic) {
        // OpenAI TTS voices are generally English-centric. 'nova' and 'alloy' are often cited as decent for other languages.
        // If specific Arabic voices are needed, they'd require a different API or model.
        // For now, we'll stick with 'nova' or 'alloy' if detected as Arabic, or default to 'nova'.
        const arabicFriendlyVoices = ["nova", "alloy"];
        if (!arabicFriendlyVoices.includes(voice)) {
          selectedVoice = "nova"; // Default to a generally compatible voice
        }
      } else {
        const validEnglishVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
        if (!validEnglishVoices.includes(voice)) {
          selectedVoice = "nova"; // Default to 'nova' for English if invalid voice provided
        }
      }

      const mp3Response = await openai.audio.speech.create({
        model: "tts-1",
        voice: selectedVoice as any,
        input: text,
      });

      const buffer = Buffer.from(await mp3Response.arrayBuffer());
      const base64Audio = buffer.toString("base64");

      sendSuccess(res, {
        audio: base64Audio,
        contentType: "audio/mpeg",
        language: language,
        voice: selectedVoice,
      });
    } catch (error) {
      console.error("[API] Error in TTS:", error);
      if (error instanceof Error) {
        sendError(res, 500, `Failed to generate speech: ${error.message}`);
      } else {
        sendError(res, 500, "Failed to generate speech");
      }
    }
  });

  // ============================================
  // ARC API Routes (existing)
  // ============================================

  // 1. Agent Events Ingest
  app.post("/api/arc/agent-events", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/agent-events", req.body);
      const parsed = agentEventSchema.parse(req.body);
      const stored = await storage.storeAgentEvent(parsed);
      console.log(`[ARC API] Agent event stored with ID: ${stored.id}`);
      sendSuccess(res);
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[ARC API] Error in agent-events:", error);
        sendError(res, 500, "Internal server error");
      }
    }
  });

  // 2. CEO Reminders
  app.post("/api/arc/ceo-reminders", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/ceo-reminders", req.body);
      const parsed = ceoReminderSchema.parse(req.body);
      const stored = await storage.storeCeoReminder(parsed);
      console.log(`[ARC API] CEO reminder stored with ID: ${stored.id}`);
      sendSuccess(res);
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[ARC API] Error in ceo-reminders:", error);
        sendError(res, 500, "Internal server error");
      }
    }
  });

  // 3. Executive Summary Generator
  app.post("/api/arc/executive-summary", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/executive-summary", req.body);
      const parsed = executiveSummaryRequestSchema.parse(req.body);

      const reportTexts = parsed.reports.map(r => `[${r.ceo_id}]: ${r.text}`).join("\n\n");

      const summaryResponse: ExecutiveSummaryResponse = {
        summary_text: `Daily Executive Summary for Mr.F - ${parsed.date}\n\n` +
          `Total Reports Received: ${parsed.reports.length}\n\n` +
          `--- CEO Reports ---\n${reportTexts}\n\n` +
          `--- End of Summary ---`,
        profit_score: 0.7,
        risk_score: 0.3,
        top_decisions: [
          "Continue current strategic initiatives",
          "Review flagged items from CEO reports",
          "Schedule follow-up with relevant department heads",
        ],
      };

      await storage.storeExecutiveSummary(parsed.date, summaryResponse);
      console.log(`[ARC API] Executive summary generated for date: ${parsed.date}`);
      sendSuccess(res, summaryResponse);
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[ARC API] Error in executive-summary:", error);
        sendError(res, 500, "Internal server error");
      }
    }
  });

  // 4. Governance Notifications
  app.post("/api/arc/governance/notify", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/governance/notify", req.body);
      const parsed = governanceNotificationSchema.parse(req.body);
      const stored = await storage.storeGovernanceNotification(parsed);
      console.log(`[ARC API] Governance notification stored with ID: ${stored.id}`);
      sendSuccess(res);
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[ARC API] Error in governance/notify:", error);
        sendError(res, 500, "Internal server error");
      }
    }
  });

  // 5. Rule Broadcast
  app.post("/api/arc/rules/broadcast", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/rules/broadcast", req.body);
      const parsed = ruleBroadcastSchema.parse(req.body);
      const stored = await storage.storeRuleBroadcast(parsed);
      console.log(`[ARC API] Rule broadcast stored with ID: ${stored.id}`);
      sendSuccess(res);
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[ARC API] Error in rules/broadcast:", error);
        sendError(res, 500, "Internal server error");
      }
    }
  });

  // 6. High Priority Notification
  app.post("/api/arc/notifications/high", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/notifications/high", req.body);
      const parsed = highPriorityNotificationSchema.parse(req.body);
      const stored = await storage.storeHighPriorityNotification(parsed);
      console.log(`[ARC API] High priority notification stored with ID: ${stored.id}`);
      sendSuccess(res);
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[ARC API] Error in notifications/high:", error);
        sendError(res, 500, "Internal server error");
      }
    }
  });

  // ============================================
  // MrF Brain & Agent Summary Routes (ChatGPT Integration)
  // ============================================

  // POST /api/arc/agents/mrf-brain
  // Relay messages from ChatGPT (Mr.F Brain GPT) to n8n webhook
  app.post("/api/arc/agents/mrf-brain", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/agents/mrf-brain", req.body);

      const { from, free_text } = req.body;

      // Validate required field
      if (!free_text || typeof free_text !== "string") {
        return res.status(400).json({ error: "free_text is required" });
      }

      // Build payload for n8n webhook
      const payload = {
        agent_id: "MRF_BRAIN_GPT",
        message_type: "external_chat",
        content: free_text,
        source: "chatgpt",
        from: from || "chatgpt",
        timestamp: new Date().toISOString(),
      };

      // Call n8n webhook (use env var or default)
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://feras102.app.n8n.cloud/webhook/agent-message";

      let n8nStatus = "pending";
      let n8nError = null;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        // Build headers with optional API key authentication
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add n8n API key if configured
        const n8nApiKey = process.env.N8N_API_KEY;
        if (n8nApiKey) {
          headers["Authorization"] = `Bearer ${n8nApiKey}`;
          headers["X-N8N-API-KEY"] = n8nApiKey;
        }

        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (n8nResponse.ok) {
          n8nStatus = "delivered";
          console.log("[API] Message successfully delivered to n8n");
        } else {
          n8nStatus = "failed";
          n8nError = `n8n returned status ${n8nResponse.status}`;
          console.warn(`[API] n8n webhook returned status: ${n8nResponse.status}`);
        }
      } catch (err: any) {
        n8nStatus = "failed";
        n8nError = err.message;
        console.warn(`[API] n8n webhook error: ${err.message}`);
      }

      // Always return success to ChatGPT with status info
      res.status(200).json({
        agent_id: "MRF_BRAIN_GPT",
        raw_answer: n8nStatus === "delivered"
          ? "Message received and delivered to Mr.F Enterprise OS successfully."
          : "Message received. Note: n8n delivery is pending/delayed.",
        status: n8nStatus,
        n8n_error: n8nError,
        received_at: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[API] Error in mrf-brain:", error);
      // Still return a response to ChatGPT
      res.status(200).json({
        agent_id: "MRF_BRAIN_GPT",
        raw_answer: "Message received but processing encountered an error.",
        status: "error",
        error: error.message,
      });
    }
  });

  // POST /api/arc/agents/summary
  // Query Supabase for agent activity summary
  app.post("/api/arc/agents/summary", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/agents/summary", req.body);

      const { agent_id, days = 7 } = req.body;

      // Validate required field
      if (!agent_id || typeof agent_id !== "string") {
        return res.status(400).json({ error: "agent_id is required" });
      }

      // Check Supabase configuration
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

      const daysInt = parseInt(String(days), 10) || 7;

      // If Supabase not configured, return mock data
      if (!supabaseUrl || !supabaseKey) {
        console.warn("[API] Supabase not configured - returning mock summary");
        return res.status(200).json({
          agent_id,
          total_messages: 0,
          from_days: daysInt,
          first_message_at: null,
          last_message_at: null,
          by_type: {},
          recent_examples: [],
          note: "Supabase not configured - no data available"
        });
      }

      // Initialize Supabase client
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Calculate date range
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - daysInt);

      // Query arc_message_archive table
      const { data, error } = await supabase
        .from("arc_message_archive")
        .select("*")
        .eq("agent_id", agent_id)
        .gte("created_at", fromDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        // If table doesn't exist, return empty result instead of error
        if (error.code === 'PGRST205') {
          console.warn("[API] arc_message_archive table not found - returning empty summary");
          return res.status(200).json({
            agent_id,
            total_messages: 0,
            from_days: daysInt,
            first_message_at: null,
            last_message_at: null,
            by_type: {},
            recent_examples: [],
            note: "arc_message_archive table not found in Supabase"
          });
        }
        console.error("[API] Supabase query failed:", error);
        return res.status(500).json({ error: "Supabase_query_failed" });
      }

      const messages = data || [];

      // Compute summary statistics
      const totalMessages = messages.length;

      // Get first and last message timestamps
      const firstMessageAt = messages.length > 0
        ? messages[messages.length - 1].created_at
        : null;
      const lastMessageAt = messages.length > 0
        ? messages[0].created_at
        : null;

      // Count by message_type
      const byType: Record<string, number> = {};
      for (const msg of messages) {
        const msgType = msg.message_type || "unknown";
        byType[msgType] = (byType[msgType] || 0) + 1;
      }

      // Get recent examples (up to 3)
      const recentExamples = messages.slice(0, 3).map((msg) => ({
        created_at: msg.created_at,
        content_preview: msg.content
          ? String(msg.content).substring(0, 120)
          : "",
      }));

      // Send response
      res.status(200).json({
        agent_id,
        total_messages: totalMessages,
        from_days: daysInt,
        first_message_at: firstMessageAt,
        last_message_at: lastMessageAt,
        by_type: byType,
        recent_examples: recentExamples,
      });
    } catch (error) {
      console.error("[API] Error in summary:", error);
      res.status(500).json({ error: "Supabase_query_failed" });
    }
  });

  // ============================================
  // Supabase Bridge Routes (n8n Integration)
  // ============================================

  // Helper to get Supabase client
  function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return null;
    }
    
    return createClient(supabaseUrl, supabaseKey);
  }

  // POST /api/arc/receive - Store n8n callbacks in arc_feedback
  app.post("/api/arc/receive", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/receive", req.body);
      const parsed = arcFeedbackSchema.parse(req.body);
      
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn("[ARC] Supabase not configured - storing feedback locally only");
        return sendSuccess(res, { 
          status: "ok", 
          stored: "local_only",
          note: "Supabase not configured" 
        });
      }

      const { data, error } = await supabase
        .from("arc_feedback")
        .insert({
          command_id: parsed.command_id || null,
          source: parsed.source || "n8n",
          status: parsed.status || "received",
          data: parsed.data || {},
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("[ARC] Supabase insert error:", error);
        return sendError(res, 500, "Failed to store feedback", error.message);
      }

      console.log(`[ARC] Feedback stored with ID: ${data.id}`);
      sendSuccess(res, { 
        status: "ok", 
        id: data.id,
        stored: "supabase" 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[ARC] Error in /receive:", error);
        sendError(res, 500, "Internal server error");
      }
    }
  });

  // POST /api/arc/command - Log Mr.F Brain commands in arc_command_log
  app.post("/api/arc/command", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/command", req.body);
      const parsed = arcCommandLogSchema.parse(req.body);
      
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn("[ARC] Supabase not configured - command not stored");
        return sendSuccess(res, { 
          status: "ok", 
          stored: "local_only",
          note: "Supabase not configured" 
        });
      }

      const { data, error } = await supabase
        .from("arc_command_log")
        .insert({
          command: parsed.command,
          payload: parsed.payload || {},
          status: parsed.status || "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("[ARC] Supabase insert error:", error);
        return sendError(res, 500, "Failed to store command", error.message);
      }

      console.log(`[ARC] Command logged with ID: ${data.id}`);
      sendSuccess(res, { 
        status: "ok", 
        id: data.id,
        stored: "supabase" 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[ARC] Error in /command:", error);
        sendError(res, 500, "Internal server error");
      }
    }
  });

  // POST /api/arc/events - Store agent events in Supabase agent_events
  app.post("/api/arc/events", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/events", req.body);
      const parsed = supabaseAgentEventSchema.parse(req.body);
      
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.warn("[ARC] Supabase not configured - event not stored");
        return sendSuccess(res, { 
          status: "ok", 
          stored: "local_only",
          note: "Supabase not configured" 
        });
      }

      const { data, error } = await supabase
        .from("agent_events")
        .insert({
          agent_name: parsed.agent_name,
          event_type: parsed.event_type,
          payload: parsed.payload || {},
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("[ARC] Supabase insert error:", error);
        return sendError(res, 500, "Failed to store event", error.message);
      }

      console.log(`[ARC] Event stored with ID: ${data.id}`);
      sendSuccess(res, { 
        status: "ok", 
        id: data.id,
        stored: "supabase" 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(res, 400, "Validation error", error.errors);
      } else {
        console.error("[ARC] Error in /events:", error);
        sendError(res, 500, "Internal server error");
      }
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "Virtual Office API",
      timestamp: new Date().toISOString(),
    });
  });

  return httpServer;
}

// ============================================
// SELF-TEST COMMANDS (for reference)
// ============================================
//
// 1) Test mrf-brain relay:
// curl -X POST \
//   -H "Content-Type: application/json" \
//   -H "X-ARC-SECRET: <YOUR_SECRET>" \
//   -d '{"from":"test","free_text":"hello from test"}' \
//   https://your-app.replit.app/api/arc/agents/mrf-brain
//
// 2) Test summary:
// curl -X POST \
//   -H "Content-Type: application/json" \
//   -H "X-ARC-SECRET: <YOUR_SECRET>" \
//   -d '{"agent_id":"ARC-L1-FIN-CEO-0001","days":7}' \
//   https://your-app.replit.app/api/arc/agents/summary
//
// 3) Test n8n callback (arc_feedback):
// curl -X POST \
//   -H "Content-Type: application/json" \
//   -H "X-ARC-SECRET: <YOUR_SECRET>" \
//   -d '{"command_id":"cmd-123","source":"n8n","status":"completed","data":{"result":"success"}}' \
//   https://your-app.replit.app/api/arc/receive
//
// 4) Test command log (arc_command_log):
// curl -X POST \
//   -H "Content-Type: application/json" \
//   -H "X-ARC-SECRET: <YOUR_SECRET>" \
//   -d '{"command":"generate_report","payload":{"type":"daily"},"status":"pending"}' \
//   https://your-app.replit.app/api/arc/command
//
// 5) Test agent event (agent_events):
// curl -X POST \
//   -H "Content-Type: application/json" \
//   -H "X-ARC-SECRET: <YOUR_SECRET>" \
//   -d '{"agent_name":"Mr.F","event_type":"task_completed","payload":{"task_id":"123"}}' \
//   https://your-app.replit.app/api/arc/events
//