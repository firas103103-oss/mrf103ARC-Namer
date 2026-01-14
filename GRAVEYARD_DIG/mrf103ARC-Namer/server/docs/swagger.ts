import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

/**
 * Swagger/OpenAPI Documentation Configuration
 */

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ARC System API Documentation",
      version: "2.0.0",
      description: `
# ARC System - Multi-Agent Intelligence Platform

## Overview
نظام ARC هو منصة ذكاء اصطناعي متعددة الوكلاء (Multi-Agent) مع نظام أرشفة، 
إدارة المهام، التعلم الآلي، والتكاملات الخارجية.

## Features
- 🤖 **6 AI Agents**: Mr.F, L0-Ops, L0-Comms, L0-Intel, Dr. Maya, Jordan
- 📦 **Archive System**: AES-256-GCM encrypted archives
- 🔗 **Integrations**: n8n, ElevenLabs, OpenAI, Anthropic, Gemini
- 📊 **Analytics**: Real-time performance tracking
- 🔐 **Security**: Role-based access control + RLS

## Authentication
معظم endpoints تحتاج authentication. استخدم:
\`\`\`
POST /api/auth/login
Body: { "username": "admin", "password": "your-password" }
\`\`\`

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user

## Error Codes
- 400: Validation Error
- 401: Authentication Required
- 403: Access Denied
- 404: Not Found
- 500: Internal Server Error
- 502: External Service Error
      `,
      contact: {
        name: "ARC System Support",
        email: "support@mrf103.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === "production" 
          ? "https://app.mrf103.com" 
          : "http://localhost:5001",
        description: process.env.NODE_ENV === "production" ? "Production" : "Development",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description: "Session cookie authentication",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "VALIDATION_ERROR",
                },
                message: {
                  type: "string",
                  example: "Invalid input data",
                },
              },
            },
          },
        },
        Agent: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "Mr.F",
            },
            role: {
              type: "string",
              example: "system-architect",
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "busy"],
              example: "active",
            },
            capabilities: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["planning", "architecture", "coordination"],
            },
          },
        },
        Archive: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
            },
            name: {
              type: "string",
              example: "project-backup-2025",
            },
            description: {
              type: "string",
              example: "Full project backup",
            },
            size: {
              type: "integer",
              example: 1024000,
            },
            encrypted: {
              type: "boolean",
              example: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "تسجيل الدخول وإدارة الجلسات",
      },
      {
        name: "Agents",
        description: "إدارة الوكلاء الذكيين",
      },
      {
        name: "Archives",
        description: "نظام الأرشفة المشفر",
      },
      {
        name: "Tasks",
        description: "إدارة المهام والتعيينات",
      },
      {
        name: "Integrations",
        description: "التكاملات الخارجية (n8n, ElevenLabs, etc)",
      },
      {
        name: "Analytics",
        description: "التقارير والإحصائيات",
      },
    ],
  },
  apis: [
    "./server/routes/*.ts",
    "./server/modules/*.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  // Swagger UI
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "ARC System API Docs",
  }));

  // JSON spec
  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("📚 Swagger docs available at: /api/docs");
}

export default swaggerSpec;
