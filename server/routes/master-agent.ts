import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { eq, desc, sql } from "drizzle-orm";
import { arcCommandLog, agents } from "@shared/schema";
import OpenAI from "openai";

export const masterAgentRouter = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory storage for active tasks and decisions (في الإنتاج، استخدم Redis)
const activeTasks = new Map();
const pendingDecisions = new Map();
const agentsStatus = new Map();

// Initialize agents status
const AGENT_IDS = [
  "mrf",
  "l0-ops",
  "l0-comms",
  "l0-intel",
  "photographer",
  "grants",
  "legal",
  "finance",
  "creative",
  "researcher",
];

AGENT_IDS.forEach((id) => {
  agentsStatus.set(id, {
    id,
    name: id.toUpperCase().replace(/-/g, " "),
    status: "idle",
    currentTask: null,
    efficiency: Math.floor(Math.random() * 20) + 80, // 80-100%
    tasksCompleted: 0,
  });
});

// ============================================
// MASTER AGENT CORE LOGIC
// ============================================

interface TaskPlan {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  steps: Array<{
    action: string;
    assignedAgent: string;
    estimatedTime: number;
  }>;
  estimatedTime: number;
}

async function analyzeCommand(command: string): Promise<TaskPlan> {
  try {
    const systemPrompt = `You are MRF Executive Master Agent - a highly intelligent AI assistant with full authority to act on behalf of the user.

Your role:
1. Analyze user commands and break them into actionable tasks
2. Determine optimal execution strategy
3. Assign tasks to specialized agents
4. Estimate time and resources needed

Available agents and their specialties:
- MRF: Executive decisions, strategic planning, growth monitoring
- L0-Ops: Operations, task management, automation
- L0-Comms: Communications, messaging, announcements
- L0-Intel: Research, analysis, intelligence gathering
- Photographer: Visual content, photography
- Grants: Funding, proposals, grants
- Legal: Legal advice, contracts, compliance
- Finance: Financial analysis, budgeting
- Creative: Design, branding, marketing
- Researcher: Deep research, fact-checking

Special Commands:
- "check growth" or "growth status": Check the 90-day growth plan progress
- "today's tasks": Show today's tasks from the growth roadmap
- "investment readiness": Show current investment readiness score

Respond with a JSON object:
{
  "title": "Brief task title",
  "description": "Detailed description",
  "priority": "low|medium|high|critical",
  "steps": [
    {
      "action": "What to do",
      "assignedAgent": "Agent ID",
      "estimatedTime": seconds
    }
  ],
  "estimatedTime": total_seconds
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: command },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const plan = JSON.parse(response.choices[0].message.content || "{}");
    return plan;
  } catch (error) {
    console.error("Error analyzing command:", error);
    // Fallback plan
    return {
      title: "Execute Command",
      description: command,
      priority: "medium",
      steps: [
        {
          action: "Analyze and execute",
          assignedAgent: "l0-ops",
          estimatedTime: 30,
        },
      ],
      estimatedTime: 30,
    };
  }
}

async function makeDecision(context: any): Promise<any> {
  try {
    const systemPrompt = `You are MRF Executive Master Agent making strategic decisions.

Analyze the situation and provide:
1. A clear question that needs decision
2. Multiple options (2-4)
3. Your recommendation with reasoning
4. Confidence level (0-1)

Respond with JSON:
{
  "question": "What should we do?",
  "options": ["Option 1", "Option 2"],
  "recommendation": "Option 1",
  "reasoning": "Because...",
  "confidence": 0.85
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(context) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const decision = JSON.parse(response.choices[0].message.content || "{}");
    return decision;
  } catch (error) {
    console.error("Error making decision:", error);
    return null;
  }
}

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateDecisionId(): string {
  return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// API ENDPOINTS
// ============================================

// Execute Command
masterAgentRouter.post("/execute", async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== "string") {
      return res.status(400).json({ error: "Invalid command" });
    }

    // Log command
    const [commandLog] = await db
      .insert(arcCommandLog)
      .values({
        command: "master-agent-execute",
        payload: { command },
        status: "pending",
        source: "master-agent",
        userId: (req as any).session?.userId || "system",
      })
      .returning();

    // Analyze command with AI
    const plan = await analyzeCommand(command);

    // Create task
    const taskId = generateTaskId();
    const task = {
      id: taskId,
      title: plan.title,
      description: plan.description,
      priority: plan.priority,
      status: "analyzing" as const,
      assignedTo: plan.steps.map((s) => s.assignedAgent),
      progress: 0,
      estimatedTime: plan.estimatedTime,
      createdAt: new Date(),
      updatedAt: new Date(),
      commandLogId: commandLog.id,
      steps: plan.steps,
    };

    activeTasks.set(taskId, task);

    // Start execution in background
    executeTask(taskId, plan).catch((err) => {
      console.error("Task execution error:", err);
      const t = activeTasks.get(taskId);
      if (t) {
        t.status = "failed";
        t.updatedAt = new Date();
      }
    });

    res.json({
      success: true,
      taskId,
      message: "Master Agent is processing your command",
      plan,
    });
  } catch (error) {
    console.error("Error executing command:", error);
    res.status(500).json({ error: "Failed to execute command" });
  }
});

async function executeTask(taskId: string, plan: TaskPlan) {
  const task = activeTasks.get(taskId);
  if (!task) return;

  // Simulate execution
  task.status = "routing";
  task.progress = 10;
  task.updatedAt = new Date();

  await new Promise((resolve) => setTimeout(resolve, 2000));

  task.status = "executing";
  task.progress = 30;
  task.updatedAt = new Date();

  // Execute steps
  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];

    // Update agent status
    const agent = agentsStatus.get(step.assignedAgent);
    if (agent) {
      agent.status = "busy";
      agent.currentTask = step.action;
    }

    // Simulate step execution
    await new Promise((resolve) => setTimeout(resolve, step.estimatedTime * 1000));

    // Update progress
    task.progress = 30 + ((i + 1) / plan.steps.length) * 60;
    task.updatedAt = new Date();

    // Reset agent status
    if (agent) {
      agent.status = "idle";
      agent.currentTask = null;
      agent.tasksCompleted++;
    }
  }

  // Complete task
  task.status = "completed";
  task.progress = 100;
  task.updatedAt = new Date();
  task.actualTime = Math.floor((Date.now() - task.createdAt.getTime()) / 1000);
  task.result = {
    success: true,
    message: "Task completed successfully",
    details: plan.steps.map((s) => ({
      action: s.action,
      agent: s.assignedAgent,
      completed: true,
    })),
  };

  // Update command log
  if (task.commandLogId) {
    await db
      .update(arcCommandLog)
      .set({
        status: "completed",
        durationMs: task.actualTime * 1000,
        completedAt: new Date(),
      })
      .where(eq(arcCommandLog.id, task.commandLogId));
  }
}

// Get All Tasks
masterAgentRouter.get("/tasks", async (req, res) => {
  try {
    const tasks = Array.from(activeTasks.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Get Pending Decisions
masterAgentRouter.get("/decisions", async (req, res) => {
  try {
    const decisions = Array.from(pendingDecisions.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    res.json(decisions);
  } catch (error) {
    console.error("Error fetching decisions:", error);
    res.status(500).json({ error: "Failed to fetch decisions" });
  }
});

// Approve Decision
masterAgentRouter.post("/approve-decision", async (req, res) => {
  try {
    const { decisionId, option } = req.body;

    const decision = pendingDecisions.get(decisionId);
    if (!decision) {
      return res.status(404).json({ error: "Decision not found" });
    }

    decision.selectedOption = option;
    decision.approvedAt = new Date();

    // Continue task execution based on decision
    const task = activeTasks.get(decision.taskId);
    if (task) {
      task.status = "executing";
      task.updatedAt = new Date();
    }

    res.json({ success: true, decision });
  } catch (error) {
    console.error("Error approving decision:", error);
    res.status(500).json({ error: "Failed to approve decision" });
  }
});

// Get Agents Status
masterAgentRouter.get("/agents-status", async (req, res) => {
  try {
    const status = Array.from(agentsStatus.values());
    res.json(status);
  } catch (error) {
    console.error("Error fetching agents status:", error);
    res.status(500).json({ error: "Failed to fetch agents status" });
  }
});

// Get Stats
masterAgentRouter.get("/stats", async (req, res) => {
  try {
    const tasks = Array.from(activeTasks.values());
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const activeTasksCount = tasks.filter((t: any) =>
      ["analyzing", "routing", "executing"].includes(t.status)
    ).length;

    const completedWithTime = tasks.filter((t) => t.actualTime);
    const avgExecutionTime =
      completedWithTime.length > 0
        ? Math.floor(
            completedWithTime.reduce((sum, t) => sum + (t.actualTime || 0), 0) /
              completedWithTime.length
          )
        : 0;

    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const today = new Date().toDateString();
    const decisionsToday = Array.from(pendingDecisions.values()).filter(
      (d) => d.timestamp.toDateString() === today
    ).length;

    res.json({
      totalTasks,
      completedTasks,
      activeTasks: activeTasksCount,
      successRate,
      avgExecutionTime,
      decisionsToday,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Request Decision (for use by other parts of system)
masterAgentRouter.post("/request-decision", async (req, res) => {
  try {
    const { taskId, context } = req.body;

    const decision = await makeDecision(context);
    if (!decision) {
      return res.status(500).json({ error: "Failed to generate decision" });
    }

    const decisionId = generateDecisionId();
    const decisionRecord = {
      id: decisionId,
      taskId,
      question: decision.question,
      options: decision.options,
      reasoning: decision.reasoning,
      confidence: decision.confidence,
      timestamp: new Date(),
    };

    pendingDecisions.set(decisionId, decisionRecord);

    res.json({ success: true, decision: decisionRecord });
  } catch (error) {
    console.error("Error requesting decision:", error);
    res.status(500).json({ error: "Failed to request decision" });
  }
});

// Clear completed tasks (cleanup endpoint)
masterAgentRouter.post("/cleanup", async (req, res) => {
  try {
    const { olderThan = 3600 } = req.body; // default 1 hour

    const cutoff = Date.now() - olderThan * 1000;
    let removed = 0;

    activeTasks.forEach((task, taskId) => {
      if (
        task.status === "completed" &&
        task.updatedAt.getTime() < cutoff
      ) {
        activeTasks.delete(taskId);
        removed++;
      }
    });

    res.json({ success: true, removedTasks: removed });
  } catch (error) {
    console.error("Error cleaning up:", error);
    res.status(500).json({ error: "Failed to cleanup" });
  }
});
// ============================================
// GROWTH ROADMAP INTEGRATION
// ============================================

// Get growth status summary (for Master Agent reporting)
masterAgentRouter.get("/growth-status", async (req, res) => {
  try {
    // Import growth modules dynamically
    const { growthMetrics, growthTasks, growthPhases } = await import("@shared/schema");

    // Get latest metrics
    const latestMetrics = await db
      .select()
      .from(growthMetrics)
      .orderBy(desc(growthMetrics.date))
      .limit(1);

    // Get tasks summary
    const totalTasks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(growthTasks);

    const completedTasks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(growthTasks)
      .where(eq(growthTasks.status, "completed"));

    const inProgressTasks = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(growthTasks)
      .where(eq(growthTasks.status, "in-progress"));

    // Get phases status
    const phases = await db
      .select()
      .from(growthPhases)
      .orderBy(growthPhases.phaseNumber);

    const metrics = latestMetrics[0] || null;

    res.json({
      currentScore: metrics?.totalScore || 72,
      targetScore: 95,
      progress: Math.round(((metrics?.totalScore || 72) - 72) / (95 - 72) * 100),
      tasks: {
        total: totalTasks[0]?.count || 0,
        completed: completedTasks[0]?.count || 0,
        inProgress: inProgressTasks[0]?.count || 0,
      },
      metrics: metrics ? {
        totalUsers: metrics.totalUsers,
        activeUsers: metrics.activeUsers,
        mrr: metrics.mrr,
        payingCustomers: metrics.payingCustomers,
        websiteVisitors: metrics.websiteVisitors,
        technicalScore: metrics.technicalScore,
        businessScore: metrics.businessScore,
        operationalScore: metrics.operationalScore,
        polishScore: metrics.polishScore,
      } : null,
      phases: phases.map(p => ({
        number: p.phaseNumber,
        name: p.name,
        status: p.status,
        targetScore: p.targetScore,
      })),
    });
  } catch (error) {
    console.error("Error fetching growth status:", error);
    res.status(500).json({ error: "Failed to fetch growth status" });
  }
});