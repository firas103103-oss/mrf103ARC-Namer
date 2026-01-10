
import { createServer, ServerResponse } from "http";
import express, { type Request, Response, NextFunction, type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import path from "path";
import * as Sentry from "@sentry/node";
// Import our new enterprise middleware
import logger, { requestLogger, healthMonitor, performanceMonitor, logAudit } from "./utils/logger";
import { globalErrorHandler, notFoundHandler, requestIdMiddleware, unhandledRejectionHandler, uncaughtExceptionHandler } from "./middleware/error-handler";
import { securityHeaders, apiRateLimit, authRateLimit, sanitizeInput } from "./middleware/security";
import authRoutes from "./routes/auth";
import healthRoutes from "./routes/health";
import { registerRoutes } from "./routes";
import { initializeRealtimeSubscriptions } from "./realtime";
import { handleRealtimeChatUpgrade } from "./chatRealtime";
import { validateEnv } from "./utils/env-validator";
import { TenantService } from "./services/tenant-service";
import EventLedger from "./services/event-ledger";
import { initializeAgentRegistry } from "./agents/registry";
import { metricsMiddleware } from "./services/production-metrics";
import { acriRouter } from "./routes/acri";
import metricsRoutes from "../src/routes/metrics.routes";
import { superSystem } from "../src/SuperIntegration";
import { metricsCollector } from "../src/infrastructure/monitoring/MetricsCollector";

// Register process handlers for graceful shutdown
process.on('unhandledRejection', unhandledRejectionHandler);
process.on('uncaughtException', uncaughtExceptionHandler);

// Initialize Sentry (only in production)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
  logger.info('✅ Sentry monitoring initialized');
}

// Validate environment variables before starting
try {
  validateEnv();
} catch (error) {
  logger.error('❌ Environment validation failed:', error);
  process.exit(1);
}

export function log(message: unknown, scope?: string) {
  if (scope) {
    logger.info(`[${scope}] ${message}`);
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

// Trust proxy - CRITICAL for Railway/Cloudflare
app.set("trust proxy", 1);

// Add request ID to all requests
app.use(requestIdMiddleware);

// Enterprise security headers
app.use(securityHeaders);

// Request logging middleware
app.use(requestLogger);

// Input sanitization
app.use(sanitizeInput);

// Apply rate limiting to different routes
app.use('/api/auth', authRateLimit);
app.use('/api/', apiRateLimit);

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
      logger.warn(`⚠️ Blocked CORS request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Middleware to record HTTP metrics for Super AI System
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    metricsCollector.recordHttpRequest(req.method, req.path, res.statusCode, duration);
  });
  next();
});

// Remove duplicate helmet usage (already included in securityHeaders)
// Security headers with Helmet
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https:"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for React
//       imgSrc: ["'self'", "data:", "https:"],
//       connectSrc: ["'self'", "https:", "wss:"],
//       fontSrc: ["'self'", "data:", "https:"],
//       objectSrc: ["'none'"],
//       mediaSrc: ["'self'"],
//       frameSrc: ["'none'"],
//     },
//   },
//   crossOriginEmbedderPolicy: false, // Allow external resources
// }));

// Legacy helmet configuration is replaced by our security middleware

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sentry request handler (must be before all routes)
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  // @ts-ignore - Sentry types issue
  app.use(Sentry.Handlers.requestHandler());
  // @ts-ignore - Sentry types issue
  app.use(Sentry.Handlers.tracingHandler());
}

// Database and Session Configuration
let sessionMiddleware: any;

if (process.env.NODE_ENV === 'development') {
  // Development: Use simple in-memory sessions
  sessionMiddleware = session({
    name: "arc.sid",
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
  logger.info('✅ Using development session store (memory)');
} else {
  // Production: PostgreSQL Session Store
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
  `).catch(err => logger.error('Session table creation error (non-fatal):', err.message));

  sessionMiddleware = session({
    name: "arc.sid",
    secret: process.env.SESSION_SECRET || process.env.ARC_BACKEND_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    store: new PgStore({
      pool: pgPool,
      tableName: "session",
      createTableIfMissing: false,
    }),
    cookie: {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      domain: ".mrf103.com",
    },
  });
  logger.info('✅ Using production session store (PostgreSQL)');
}

app.use(sessionMiddleware);

// Production metrics collection (Phase 5)
app.use(metricsMiddleware());

// ACRI routes (Phase 6)
app.use("/api/acri", acriRouter);

// Super AI System metrics routes
app.use("/api", metricsRoutes);

// ARC 2.0 Routes - New 31-Agent Hierarchy System
import arcRouter from "./routes/arc.routes";
app.use("/api/arc", arcRouter);

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

  // Bootstrap tenant and log system startup
  await TenantService.bootstrapTenant();
  await initializeAgentRegistry();
  
  // Start Super AI System
  await superSystem.start();
  
  await EventLedger.log({
    type: "system.startup",
    actor: "system",
    payload: {
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "2.1.0",
    },
  });

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

  // Add 404 handler for unmatched routes
  app.use(notFoundHandler);

  // Enterprise error handler (should be last)
  app.use(globalErrorHandler);

  // Use the PORT environment variable (Railway provides this automatically)
  // Default to 5001 for local development (9002 was old port)
  const port = process.env.PORT ? Number(process.env.PORT) : 5001;
  const host = "0.0.0.0"; // Allow external access
  
  httpServer.listen(port, host, () => {
    console.log(`✅ Server is live and listening on ${host}:${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();
