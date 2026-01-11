import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Virtual Office Platform is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /api/health/db
 * Database health check
 */
router.get("/db", async (req: Request, res: Response) => {
  try {
    // Simple database connectivity check
    // You can add actual DB query here if needed
    res.status(200).json({
      success: true,
      message: "Database connection is healthy",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
