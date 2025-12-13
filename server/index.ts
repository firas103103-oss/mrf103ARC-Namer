// ==================== IMPORTS ====================
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";

// ==================== SERVER BASE ====================
const app = express();
const httpServer = createServer(app);

// enable CORS for all origins (safe default)
app.use(cors());

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

// ==================== LOGGING FUNCTION ====================
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// ==================== SECURITY MONITOR ====================
let unauthorizedAttempts = 0;
let lastUnauthorizedPath = "";

// Reset and report every 24 hours
setInterval(() => {
  if (unauthorizedAttempts > 0) {
    log(
      `🧱 Security report: ${unauthorizedAttempts} unauthorized attempt(s) today (latest: ${lastUnauthorizedPath})`,
      "security",
    );
    unauthorizedAttempts = 0;
    lastUnauthorizedPath = "";
  }
}, 24 * 60 * 60 * 1000); // 24 hours

// ==================== SECURITY MIDDLEWARE ====================
// Auth routes that bypass X-ARC-SECRET check (Replit Auth routes)
// These are paths RELATIVE to the /api mount point
const authBypassPaths = ["/login", "/logout", "/callback", "/auth/user"];

// Protect all /api routes using ARC_BACKEND_SECRET (except auth routes)
app.use("/api", (req: Request, res: Response, next: NextFunction) => {
  // Skip X-ARC-SECRET check for auth routes
  // req.path is relative to the mount point (/api), so check against paths without /api prefix
  if (authBypassPaths.some(bypassPath => req.path === bypassPath || req.path.startsWith(bypassPath + "?"))) {
    return next();
  }

  const clientSecret = req.headers["x-arc-secret"];
  const serverSecret = process.env.ARC_BACKEND_SECRET;

  if (!serverSecret) {
    log("⚠️ ARC_BACKEND_SECRET not configured in environment!", "security");
    return res.status(500).json({ error: "Server misconfigured: missing ARC_BACKEND_SECRET" });
  }

  if (!clientSecret || clientSecret !== serverSecret) {
    unauthorizedAttempts += 1;
    lastUnauthorizedPath = req.path;
    log(`⛔ Unauthorized attempt #${unauthorizedAttempts} → ${req.path}`, "security");
    return res.status(401).json({ error: "Unauthorized: invalid ARC secret" });
  }

  next();
});

// ==================== REQUEST LOGGER ====================
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

// ==================== HEALTH CHECK ====================
app.get("/ping", (_req: Request, res: Response) => {
  res.json({ status: "alive", message: "✅ ARC Bridge Server is running" });
});

// ==================== ARC BRIDGE ENDPOINT ====================
app.post("/api/call_mrf_brain", async (req: Request, res: Response) => {
  try {
    const { from, free_text } = req.body;
    log(`Incoming ARC call from ${from} :: ${free_text}`, "bridge");

    // STEP 1 — process locally
    const processedResponse = {
      agent_id: "arc-core",
      raw_answer: `Message received from ${from} :: ${free_text}`,
      timestamp: new Date().toISOString(),
    };

    // STEP 2 — optionally forward to Supabase if configured
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/arc_logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            from,
            free_text,
            status: "received",
            created_at: new Date().toISOString(),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (supabaseRes.ok) {
          log("✅ Message logged in Supabase", "bridge");
        } else {
          log(`⚠️ Supabase logging failed: ${supabaseRes.status}`, "bridge");
        }
      } catch (err: any) {
        log(`❌ Supabase connection error: ${err.message}`, "bridge");
      }
    } else {
      log("⚠️ Supabase env vars not set, skipping logging", "env");
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

// ==================== ERROR HANDLER ====================
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  log(`Error: ${message}`, "error");
});

// ==================== START SERVER ====================
async function startServer() {
  // Register routes first
  await registerRoutes(httpServer, app);

  // Setup Vite for development or static files for production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static("dist/public"));
    app.get("*", (_req, res) => {
      res.sendFile("index.html", { root: "dist/public" }, (err) => {
        if (err) {
          log(`❌ Error serving index.html: ${err.message}`, "static");
          res.status(200).json({ status: "ok", message: "ARC Bridge active (no frontend found)" });
        }
      });
    });
    log("Production static serving enabled", "vite");
  } else {
    await setupVite(httpServer, app);
    log("Development Vite server enabled", "vite");
  }

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
}

startServer().catch((err) => {
  log(`❌ Failed to start server: ${err.message}`, "error");
  process.exit(1);
});
