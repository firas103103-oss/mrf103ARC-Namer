import { Router, Request, Response } from "express";
import logger from "../utils/logger";

const webhookRouter = Router();

/**
 * ADR-004: External System Orchestration Contract (v0.2)
 * 
 * Webhook stubs for external integrations.
 * Implementation deferred to v0.2.1+
 */

/**
 * POST /webhooks/n8n
 * Receive workflow events from n8n
 * 
 * Contract defined in ADR-004
 * Implementation: v0.2.1+
 */
webhookRouter.post("/n8n", async (req: Request, res: Response) => {
  try {
    // TODO: v0.2.1 - Implement n8n webhook processing
    // - Verify X-N8N-Signature
    // - Parse workflow event
    // - Route to appropriate handler
    // - Store event in database
    // - Trigger ARC actions if needed

    const { workflowId, eventType, data, timestamp } = req.body;

    console.log("[N8N Webhook] Received event", {
      workflowId,
      eventType,
      timestamp,
    });

    // Acknowledge receipt (v0.2)
    res.status(200).json({
      status: "received",
      acknowledgement: `ack_${Date.now()}`,
      note: "Full processing deferred to v0.2.1",
    });
  } catch (error) {
    logger.error("[N8N Webhook Error]", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/**
 * POST /webhooks/esp32
 * Receive sensor data from Bio Sentinel devices
 * 
 * Contract defined in ADR-004
 * Implementation: v0.2.1+
 */
webhookRouter.post("/esp32", async (req: Request, res: Response) => {
  try {
    // TODO: v0.2.1 - Implement ESP32 webhook processing
    // - Verify device authentication
    // - Parse sensor reading
    // - Store in Supabase
    // - Check for alerts
    // - Return control commands if needed

    const { deviceId, sensorType, reading, timestamp, metadata } = req.body;

    console.log("[ESP32 Webhook] Received sensor data", {
      deviceId,
      sensorType,
      reading,
      timestamp,
    });

    // Acknowledge receipt (v0.2)
    res.status(200).json({
      status: "stored",
      alerting: false,
      note: "Full processing deferred to v0.2.1",
    });
  } catch (error) {
    logger.error("[ESP32 Webhook Error]", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default webhookRouter;
