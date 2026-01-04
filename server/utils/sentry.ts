import * as Sentry from "@sentry/node";
import { Express } from "express";

/**
 * Sentry Error Tracking Configuration
 * للاستخدام في production فقط
 */

export function initSentry(app: Express) {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log("⚠️  Sentry DSN not found - Error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0, // 100% of transactions for performance monitoring
    
    // Performance Monitoring
    integrations: [
      // HTTP instrumentation
      new Sentry.Integrations.Http({ tracing: true }),
      // Express instrumentation
      new Sentry.Integrations.Express({ app }),
    ],

    // Release tracking
    release: process.env.npm_package_version,

    // Before send hook - تصفية البيانات الحساسة
    beforeSend(event, hint) {
      // Remove sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
      }
      return event;
    },
  });

  console.log("✅ Sentry initialized");
}

/**
 * Sentry Middlewares for Express
 */
export const sentryRequestHandler = () => Sentry.Handlers.requestHandler();
export const sentryTracingHandler = () => Sentry.Handlers.tracingHandler();
export const sentryErrorHandler = () => Sentry.Handlers.errorHandler();

/**
 * Capture custom exceptions
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture custom messages
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

export default Sentry;
