import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/virtual-office
 * Virtual office workspace endpoint
 */
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Virtual Office API",
    version: "1.0.0",
    features: [
      "Digital Twin Creation",
      "File Upload & Management",
      "IoT Device Integration",
      "User Profile Management"
    ]
  });
});

export default router;
