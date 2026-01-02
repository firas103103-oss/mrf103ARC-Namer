
import { createServer, ServerResponse } from "http";
import express, { type Request, Response, NextFunction, type Express } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";
import { initializeRealtimeSubscriptions } from "./realtime"; // Import the new initializer
import { handleRealtimeChatUpgrade } from "./chatRealtime";

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
  app.use(express.static(buildDir));
  // For any other request, serve the index.html file, so that client-side routing works
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(buildDir, 'index.html'));
  });
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sessionMiddleware = session({
  name: "arc.sid",
  secret: process.env.SESSION_SECRET || process.env.ARC_BACKEND_SECRET || "dev-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
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

  // Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Environment settings (Vite for preview)
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  } else {
    serveStatic(app);
  }

  // Use the PORT environment variable if available, otherwise default to 9002.
  // Use 0.0.0.0 to ensure external access in Replit/IDX environment.
    const port = Number(process.env.PORT) || 9002;
    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server is live and listening on port ${port}`);
  });
})();
