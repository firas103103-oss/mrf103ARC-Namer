import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  agentEventSchema,
  ceoReminderSchema,
  executiveSummaryRequestSchema,
  governanceNotificationSchema,
  ruleBroadcastSchema,
  highPriorityNotificationSchema,
  type ExecutiveSummaryResponse,
  type ApiSuccessResponse,
  type ApiErrorResponse,
} from "@shared/schema";
import { ZodError } from "zod";

// Authentication middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers["x-arc-secret"];
  const expectedSecret = process.env.ARC_BACKEND_SECRET;

  // In production, ARC_BACKEND_SECRET must be configured
  // In development (NODE_ENV !== 'production'), allow requests if secret is not set
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

// Request logging middleware - logs endpoint and summary info only (not full body to avoid leaking secrets)
function logRequest(endpoint: string, body: unknown) {
  console.log(`[ARC API] ${new Date().toISOString()} - ${endpoint}`);
  // Log only non-sensitive summary info
  if (body && typeof body === "object") {
    const summary: Record<string, unknown> = {};
    const safeKeys = ["event_id", "agent_id", "type", "date", "rule_id", "status", "title", "severity", "source_agent_id"];
    for (const key of safeKeys) {
      if (key in body) {
        summary[key] = (body as Record<string, unknown>)[key];
      }
    }
    if (Object.keys(summary).length > 0) {
      console.log(`[ARC API] Request summary:`, JSON.stringify(summary));
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
  // Apply auth middleware to all /api/arc routes
  app.use("/api/arc", authMiddleware);

  // ============================================
  // 1. Agent Events Ingest
  // POST /api/arc/agent-events
  // ============================================
  app.post("/api/arc/agent-events", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/agent-events", req.body);

      const parsed = agentEventSchema.parse(req.body);
      const stored = await storage.storeAgentEvent(parsed);

      console.log(`[ARC API] Agent event stored with ID: ${stored.id}`);
      console.log(`[ARC API] Event type: ${parsed.type}, Agent: ${parsed.agent_id}`);

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

  // ============================================
  // 2. CEO Reminders
  // POST /api/arc/ceo-reminders
  // ============================================
  app.post("/api/arc/ceo-reminders", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/ceo-reminders", req.body);

      const parsed = ceoReminderSchema.parse(req.body);
      const stored = await storage.storeCeoReminder(parsed);

      console.log(`[ARC API] CEO reminder stored with ID: ${stored.id}`);
      console.log(`[ARC API] Date: ${parsed.date}, Missing CEOs: ${parsed.missing_ceos.join(", ")}`);

      // Future: Trigger email/WhatsApp/internal messaging here
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

  // ============================================
  // 3. Executive Summary Generator
  // POST /api/arc/executive-summary
  // ============================================
  app.post("/api/arc/executive-summary", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/executive-summary", req.body);

      const parsed = executiveSummaryRequestSchema.parse(req.body);

      // MVP: Generate a dummy summary by concatenating reports
      // TODO: Plug in LLM for smart summary generation
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

      // Store the generated summary
      await storage.storeExecutiveSummary(parsed.date, summaryResponse);

      console.log(`[ARC API] Executive summary generated for date: ${parsed.date}`);
      console.log(`[ARC API] Processed ${parsed.reports.length} CEO reports`);

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

  // ============================================
  // 4. Governance Notifications (Harvey Specter)
  // POST /api/arc/governance/notify
  // ============================================
  app.post("/api/arc/governance/notify", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/governance/notify", req.body);

      const parsed = governanceNotificationSchema.parse(req.body);
      const stored = await storage.storeGovernanceNotification(parsed);

      console.log(`[ARC API] Governance notification stored with ID: ${stored.id}`);
      console.log(`[ARC API] Rule: ${parsed.rule_id}, Status: ${parsed.status}, Title: ${parsed.title}`);
      console.log(`[ARC API] Proposer: ${parsed.proposer_agent_id}`);

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

  // ============================================
  // 5. Rule Broadcast
  // POST /api/arc/rules/broadcast
  // ============================================
  app.post("/api/arc/rules/broadcast", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/rules/broadcast", req.body);

      const parsed = ruleBroadcastSchema.parse(req.body);
      const stored = await storage.storeRuleBroadcast(parsed);

      console.log(`[ARC API] Rule broadcast stored with ID: ${stored.id}`);
      console.log(`[ARC API] Rule: ${parsed.rule_id}, Status: ${parsed.status}, Effective: ${parsed.effective_at}`);

      // Future: Push config updates to actual agents here
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

  // ============================================
  // 6. High Priority Notification
  // POST /api/arc/notifications/high
  // ============================================
  app.post("/api/arc/notifications/high", async (req: Request, res: Response) => {
    try {
      logRequest("POST /api/arc/notifications/high", req.body);

      const parsed = highPriorityNotificationSchema.parse(req.body);
      const stored = await storage.storeHighPriorityNotification(parsed);

      console.log(`[ARC API] High priority notification stored with ID: ${stored.id}`);
      console.log(`[ARC API] Source: ${parsed.source_agent_id}, Severity: ${parsed.severity}`);
      console.log(`[ARC API] Title: ${parsed.title}`);

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
  // Health check endpoint (no auth required)
  // ============================================
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "ARC Backend API",
      timestamp: new Date().toISOString(),
    });
  });

  return httpServer;
}
