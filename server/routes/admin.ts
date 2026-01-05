import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import {
  users,
  conversations,
  chatMessages,
  arcCommandLog,
  projects,
  agents,
} from "@shared/schema";

export const adminRouter = Router();

// ============================================
// ADMIN STATS
// ============================================
adminRouter.get("/stats", async (req, res) => {
  try {
    const [totalAgentsResult, activeProjectsResult, totalTasksResult] = await Promise.all([
      db.select().from(agents),
      db.select().from(projects).where(eq(projects.status, "active")),
      db.select().from(arcCommandLog),
    ]);

    const completedTasks = await db
      .select()
      .from(arcCommandLog)
      .where(eq(arcCommandLog.status, "completed"));

    // Calculate average response time
    const completedWithDuration = completedTasks.filter((t) => t.durationMs);
    const avgResponseTime =
      completedWithDuration.length > 0
        ? Math.round(
            completedWithDuration.reduce((sum, t) => sum + (t.durationMs || 0), 0) /
              completedWithDuration.length
          )
        : 0;

    res.json({
      totalAgents: totalAgentsResult.length,
      activeAgents: totalAgentsResult.filter((a: any) => a.active).length,
      totalProjects: activeProjectsResult.length,
      activeProjects: activeProjectsResult.filter((p: any) => p.status === "active").length,
      totalTasks: totalTasksResult.length,
      completedTasks: completedTasks.length,
      systemUptime: process.uptime(),
      avgResponseTime,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ============================================
// AGENTS MANAGEMENT
// ============================================
adminRouter.get("/agents", async (req, res) => {
  try {
    const allAgents = await db.select().from(agents).orderBy(desc(agents.createdAt));
    res.json(allAgents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

const createAgentSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  systemPrompt: z.string().min(10),
  specializations: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  model: z.string().default("gpt-4"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(128000).default(4000),
  active: z.boolean().default(true),
});

adminRouter.post("/agents", async (req, res) => {
  try {
    const data = createAgentSchema.parse(req.body);

    const [newAgent] = await db
      .insert(agents)
      .values({
        ...data,
        specializations: data.specializations || [],
        capabilities: data.capabilities || [],
        temperature: String(data.temperature),
        maxTokens: data.maxTokens,
      })
      .returning();

    res.json(newAgent);
  } catch (error) {
    console.error("Error creating agent:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create agent" });
    }
  }
});

adminRouter.put("/agents/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = createAgentSchema.partial().parse(req.body);

    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.temperature !== undefined) {
      updateData.temperature = String(data.temperature);
    }

    const [updatedAgent] = await db
      .update(agents)
      .set(updateData)
      .where(eq(agents.id, id))
      .returning();

    if (!updatedAgent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json(updatedAgent);
  } catch (error) {
    console.error("Error updating agent:", error);
    res.status(500).json({ error: "Failed to update agent" });
  }
});

adminRouter.delete("/agents/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.delete(agents).where(eq(agents.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent:", error);
    res.status(500).json({ error: "Failed to delete agent" });
  }
});

// ============================================
// PROJECTS MANAGEMENT
// ============================================
adminRouter.get("/projects", async (req, res) => {
  try {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    res.json(allProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["individual", "company", "enterprise"]),
  status: z.enum(["active", "paused", "completed"]).default("active"),
  assignedAgents: z.array(z.string()).default([]),
  owner: z.string().min(1),
});

adminRouter.post("/projects", async (req, res) => {
  try {
    const data = createProjectSchema.parse(req.body);

    const [newProject] = await db.insert(projects).values(data).returning();

    res.json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to create project" });
    }
  }
});

adminRouter.put("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = createProjectSchema.partial().parse(req.body);

    const [updatedProject] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

adminRouter.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.delete(projects).where(eq(projects.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ============================================
// CORE AGENT CAPABILITIES
// ============================================
adminRouter.get("/capabilities", async (req, res) => {
  try {
    // يمكن تخزين القدرات في قاعدة البيانات أو إرجاعها من ملف التكوين
    const capabilities = [
      {
        id: "email",
        name: "Email Management",
        type: "communication",
        enabled: true,
        config: { provider: "smtp", autoRespond: true },
      },
      {
        id: "whatsapp",
        name: "WhatsApp Integration",
        type: "communication",
        enabled: true,
        config: { businessApi: true, autoReply: true },
      },
      {
        id: "calls",
        name: "Phone Calls (Twilio)",
        type: "communication",
        enabled: false,
        config: { provider: "twilio", voiceAI: true },
      },
      {
        id: "social-media",
        name: "Social Media Manager",
        type: "automation",
        enabled: true,
        config: { platforms: ["twitter", "linkedin", "instagram"], autoPost: true },
      },
      {
        id: "ad-campaigns",
        name: "Ad Campaign Manager",
        type: "automation",
        enabled: true,
        config: { platforms: ["google-ads", "facebook-ads"], budget: 5000 },
      },
      {
        id: "web-scraping",
        name: "Web Data Extraction",
        type: "integration",
        enabled: true,
        config: { respectRobots: true, rateLimit: 10 },
      },
      {
        id: "market-analysis",
        name: "Market Intelligence",
        type: "analysis",
        enabled: true,
        config: { sources: ["news", "social", "competitor"], frequency: "daily" },
      },
    ];

    res.json(capabilities);
  } catch (error) {
    console.error("Error fetching capabilities:", error);
    res.status(500).json({ error: "Failed to fetch capabilities" });
  }
});

adminRouter.put("/capabilities", async (req, res) => {
  try {
    const capability = req.body;

    // يمكن حفظها في قاعدة البيانات أو ملف تكوين
    // هنا نرجع ببساطة التأكيد
    res.json({ success: true, capability });
  } catch (error) {
    console.error("Error updating capability:", error);
    res.status(500).json({ error: "Failed to update capability" });
  }
});

// ============================================
// CORE AGENT ORCHESTRATION
// ============================================
adminRouter.post("/core-agent/execute", async (req, res) => {
  try {
    const { task, priority, requiredCapabilities } = req.body;

    // Log command
    const [commandLog] = await db
      .insert(arcCommandLog)
      .values({
        command: "core-agent-execute",
        payload: { task, priority, requiredCapabilities },
        status: "pending",
        source: "admin-panel",
        userId: (req as any).session?.userId || "system",
      })
      .returning();

    // هنا يمكن إضافة منطق توزيع المهام على الوكلاء
    // يمكن استخدام AI لاختيار الوكيل المناسب

    res.json({
      success: true,
      commandId: commandLog.id,
      message: "Task queued for execution",
    });
  } catch (error) {
    console.error("Error executing core agent task:", error);
    res.status(500).json({ error: "Failed to execute task" });
  }
});
