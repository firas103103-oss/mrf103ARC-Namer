
import { createServer, ServerResponse } from "http";
import express, { type Request, Response, NextFunction, type Express } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import path from "path";
import { registerRoutes } from "./routes";
import { initializeRealtimeSubscriptions } from "./realtime"; // Import the new initializer
import { handleRealtimeChatUpgrade } from "./chatRealtime";
import { validateEnv } from "./utils/env-validator";

// Validate environment variables before starting
try {
  validateEnv();
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

export function log(message: unknown, scope?: string) {
  if (scope) {
    console.log(`[${scope}]`, message);
    return;
  }
  console.log(message);
}

// This function will serve static files in a production environment
function serveStatic(app: Express) {
  const buildDir = path.resolve(import.meta.dirname, "..", "dist", "public");
  
  // Serve static files (CSS, JS, images, etc)
  app.use(express.static(buildDir));
  
  // IMPORTANT: This catch-all route should be LAST
  // It will serve index.html for all non-API routes (for React Router)
  app.get('*', (req, res, next) => {
    // Skip if this is an API route
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(buildDir, 'index.html'));
  });
}

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:9002',
  'http://localhost:5173',
  'https://app.mrf103.com',
  'https://mrf103arc-namer-production-236c.up.railway.app',
  process.env.VITE_API_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// PostgreSQL Session Store (production-ready)
const PgStore = connectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const sessionMiddleware = session({
  name: "arc.sid",
  secret: process.env.SESSION_SECRET || process.env.ARC_BACKEND_SECRET || "dev-session-secret",
  resave: false,
  saveUninitialized: false,
  store: new PgStore({
    pool: pgPool,
    tableName: "session", // Will auto-create table
    createTableIfMissing: true,
  }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
});

app.use(sessionMiddleware);

(async () => {
  // Activate the router from routes.ts, providing the express app
  const httpServer = await registerRoutes(app);

  // Authenticated WebSocket upgrade (text chat only)
  httpServer.on("upgrade", (request, socket, head) => {
    const url = request.url || "";
    if (!url.startsWith("/realtime")) {
      socket.destroy();
      return;
    }

    const res = new ServerResponse(request);
    sessionMiddleware(request as any, res as any, () => {
      const isAuthed = (request as any).session?.operatorAuthenticated;
      if (!isAuthed) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      handleRealtimeChatUpgrade(request, socket as any, head);
    });
  });

  // Initialize the real-time subscription service
  initializeRealtimeSubscriptions();

  // Environment settings (Vite for preview)
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  } else {
    // IMPORTANT: serveStatic must come AFTER registerRoutes
    // So API routes are registered first
    serveStatic(app);
  }

  // Error handling (should be last)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Use the PORT environment variable if available, otherwise default to 9002.
  // Use 0.0.0.0 to ensure external access in Replit/IDX environment.
    const port = Number(process.env.PORT) || 9002;
    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server is live and listening on port ${port}`);
  });
})();
