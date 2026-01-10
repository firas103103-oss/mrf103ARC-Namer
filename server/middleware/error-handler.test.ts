import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express, { Express } from "express";
import { errorHandler, notFoundHandler, ValidationError, AuthenticationError } from "../middleware/error-handler";

describe("Error Handler Middleware", () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Test routes
    app.get("/test/validation", () => {
      throw new ValidationError("Invalid input");
    });

    app.get("/test/auth", () => {
      throw new AuthenticationError();
    });

    app.get("/test/generic", () => {
      throw new Error("Generic error");
    });

    // Add error handlers
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  it("should handle ValidationError", async () => {
    const res = await request(app).get("/test/validation");
    
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.(error instanceof Error ? error.message : 'Unknown error')).toBe("Invalid input");
  });

  it("should handle AuthenticationError", async () => {
    const res = await request(app).get("/test/auth");
    
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("AUTH_ERROR");
  });

  it("should handle generic errors", async () => {
    const res = await request(app).get("/test/generic");
    
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("should handle 404 not found", async () => {
    const res = await request(app).get("/nonexistent");
    
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
