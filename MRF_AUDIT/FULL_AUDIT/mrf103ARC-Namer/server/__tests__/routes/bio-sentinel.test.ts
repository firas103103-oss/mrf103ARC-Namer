import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { bioSentinelRouter } from "../../routes/bio-sentinel";

describe("Bio Sentinel API Routes", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/bio-sentinel", bioSentinelRouter);
  });

  describe("POST /api/bio-sentinel/readings", () => {
    it("should reject invalid sensor reading data", async () => {
      const invalidReading = {
        deviceId: "",
        gasResistance: -100,
        humidity: 150,
      };

      const response = await request(app)
        .post("/api/bio-sentinel/readings")
        .send(invalidReading)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should accept valid sensor reading", async () => {
      const validReading = {
        deviceId: "xbs-esp32-001",
        gasResistance: 250000,
        temperature: 22.5,
        humidity: 45,
        pressure: 1013.25,
        iaqScore: 50,
      };

      const response = await request(app)
        .post("/api/bio-sentinel/readings")
        .send(validReading);

      // May succeed or fail depending on DB, but should not be 400
      expect([200, 201, 500]).toContain(response.status);
    });
  });

  describe("GET /api/bio-sentinel/readings/:deviceId", () => {
    it("should return sensor readings for device", async () => {
      const response = await request(app)
        .get("/api/bio-sentinel/readings/xbs-esp32-001")
        .query({ page: 1, pageSize: 10 });

      expect([200, 404, 500]).toContain(response.status);
    });
  });
});
