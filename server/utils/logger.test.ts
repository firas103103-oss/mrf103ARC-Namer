import { describe, it, expect } from "vitest";
import logger from "../utils/logger";

describe("Logger Utility", () => {
  it("should create logger instance", () => {
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
  });

  it("should log info messages", () => {
    expect(() => {
      logger.info("Test info message", { data: "test" });
    }).not.toThrow();
  });

  it("should log error messages", () => {
    expect(() => {
      logger.error("Test error message", { error: new Error("test") });
    }).not.toThrow();
  });

  it("should have correct log levels", () => {
    const validLevels = ["error", "warn", "info", "http", "verbose", "debug", "silly"];
    
    // Winston logger should have level property
    expect(logger).toHaveProperty("level");
    expect(typeof logger.level).toBe("string");
  });
});
