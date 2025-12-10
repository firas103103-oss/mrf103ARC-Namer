// ============ IMPORTS ============
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";

// ============ SERVER BASE ============
const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// JSON parsing middleware (preserve raw body)
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// ============ LOGGING FUNCTION ============
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Request logger for /api routes
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// ============ ARC BRIDGE ENDPOINT ============
app.post("/api/call_mrf_brain", async (req: Request, res: Response) => {
  try {
    const { from, free_text } = req.body;

    log(`Incoming ARC call from ${from} :: ${free_text}`, "bridge");

    // STEP 1 — forward to Replit internal logic or secondary agent if needed
    const processedResponse = {
      agent_id: "arc-core",
      raw_answer: `Message received from ${from} :: ${free_text}`,
      timestamp: new Date().toISOString(),
    };

    // STEP 2 — optionally forward to Supabase if configured
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (SUPABASE_URL && SUPABASE_KEY) {
      await fetch(`https://fqumiorpzdmkirxzveih.supabase.co`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdW1pb3JwemRta2lyeHp2ZWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODc0NTAsImV4cCI6MjA4MDk2MzQ1MH0.XmF7k37NsR_JSnNw0J17cKXP1MUyFOiXI4u49x6Nnnw`,
        },
        body: JSON.stringify({
          from,
          free_text,
          status: "received",
          created_at: new Date().toISOString(),
        }),
      });
    }

    // Respond back to caller
    res.json({
      status: "ok",
      agent_id: processedResponse.agent_id,
      raw_answer: processedResponse.raw_answer,
      time: processedResponse.timestamp,
    });

  } catch (err: any) {
    console.error("Error handling ARC call:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ============ ERROR HANDLER ============
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  log(`Error: ${message}`, "error");
});

// ============ STATIC FILES / FRONTEND ============
if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist"));
  app.get("*", (_req, res) => res.sendFile("dist/index.html"));
} else {
  log("Development mode active, no static serving.", "vite");
}

// ============ START SERVER ============
const port = parseInt(process.env.PORT || "5000", 10);
httpServer.listen(
  {
    port,
    host: "0.0.0.0",
    reusePort: true,
  },
  () => {
    log(`✅ ARC Bridge Server running on port ${port}`);
  },
);
