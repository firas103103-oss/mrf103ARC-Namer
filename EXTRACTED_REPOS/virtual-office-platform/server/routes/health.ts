import { Router, Request, Response } from "express";
import { db } from "../db/connection";

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get("/health", async (req: Request, res: Response) => {
  try {
    // Test database connection
    await db.execute`SELECT 1`;
    
    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: (error instanceof Error ? error.message : 'Unknown error'),
    });
  }
});

export default router;
