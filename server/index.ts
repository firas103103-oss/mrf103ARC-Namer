
import { createServer, ServerResponse } from "http";
import express, { type Request, Response, NextFunction, type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import path from "path";
import * as Sentry from "@sentry/node";
import { registerRoutes } from "./routes";
import { initializeRealtimeSubscriptions } from "./realtime"; // Import the new initializer
import { handleRealtimeChatUpgrade } from "./chatRealtime";
import { validateEnv } from "./utils/env-validator";

// Initialize Sentry (only in production)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    // Optional: Set release version from package.json
    // release: "arc-namer@" + process.env.npm_package_version,
  });
  console.log('✅ Sentry monitoring initialized');
}

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

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for React
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "data:", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow external resources
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sentry request handler (must be before all routes)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  // @ts-ignore - Sentry types issue
  app.use(Sentry.Handlers.requestHandler());
  // @ts-ignore - Sentry types issue
  app.use(Sentry.Handlers.tracingHandler());
}

// PostgreSQL Session Store (production-ready)
const PgStore = connectPgSimple(session);
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize session table manually to avoid file system issues in production
pgPool.query(`
  CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
  );
  CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session ("expire");
`).catch(err => console.error('Session table creation error (non-fatal):', err.message));

const sessionMiddleware = session({
  name: "arc.sid",
  secret: process.env.SESSION_SECRET || process.env.ARC_BACKEND_SECRET || "dev-session-secret",
  resave: false,
  saveUninitialized: false,
  store: new PgStore({
    pool: pgPool,
    tableName: "session",
    createTableIfMissing: false, // We create it manually above
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

  // Sentry error handler (must be before any other error middleware)
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // @ts-ignore - Sentry types issue
    app.use(Sentry.Handlers.errorHandler());
  }

  // Error handling (should be last)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error:', err);
    }
    
    res.status(status).json({ message });
  });

  // Use the PORT environment variable (Railway provides this automatically)
  // Default to 9002 for local development
  const port = process.env.PORT ? Number(process.env.PORT) : 9002;
  const host = "0.0.0.0"; // Allow external access
  
  httpServer.listen(port, host, () => {
    console.log(`✅ Server is live and listening on ${host}:${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
