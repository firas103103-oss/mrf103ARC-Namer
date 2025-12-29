
import { createServer } from "http";
import express, { type Request, Response, NextFunction, type Express } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite } from "./vite";

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
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  // Activate the router from routes.ts, providing both the http server and express app
  await registerRoutes(httpServer, app);

  // Error handling
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Environment settings (Vite for preview)
  if (app.get("env") === "development") {
    await setupVite(httpServer, app);
  } else {
    serveStatic(app);
  }

  // Run the server on port 9002 (required for the agent)
  // and use 0.0.0.0 to ensure external access in Replit/IDX environment
  const PORT = 9002;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`serving on port ${PORT}`);
  });
})();
