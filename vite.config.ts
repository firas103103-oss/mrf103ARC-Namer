import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(async () => ({
  plugins: [
    react(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID
      ? [
          (await import("@replit/vite-plugin-runtime-error-modal")).default(),
          (await import("@replit/vite-plugin-cartographer")).cartographer(),
          (await import("@replit/vite-plugin-dev-banner")).devBanner(),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));