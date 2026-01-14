import { Router } from "express";
import { db } from "../db";
import logger from "../utils/logger";
import { 
  growthPhases, 
  growthWeeks, 
  growthTasks, 
  dailyCheckIns,
  growthMetrics,
  growthMilestones
} from "../../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();

// ============================================
// GET /api/growth-roadmap/overview
// نظرة عامة على الخطة الكاملة
// ============================================
router.get("/overview", async (req, res) => {
  try {
    const phases = await db
      .select()
      .from(growthPhases)
      .orderBy(growthPhases.phaseNumber);

    const weeks = await db
      .select()
      .from(growthWeeks)
      .orderBy(growthWeeks.weekNumber);

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

    const latestMetrics = await db
      .select()
      .from(growthMetrics)
      .orderBy(desc(growthMetrics.date))
      .limit(1);

    const currentScore = latestMetrics[0]?.totalScore || 72;
    const targetScore = 95;
    const progress = Math.round(((currentScore - 72) / (95 - 72)) * 100);

    res.json({
      phases,
      weeks,
      stats: {
        totalTasks: totalTasks[0]?.count || 0,
        completedTasks: completedTasks[0]?.count || 0,
        inProgressTasks: inProgressTasks[0]?.count || 0,
        currentScore,
        targetScore,
        progress,
      },
      currentMetrics: latestMetrics[0] || null,
    });
  } catch (error) {
    logger.error("Error fetching growth roadmap overview:", error);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
});

// ============================================
// GET /api/growth-roadmap/phases
// جميع المراحل
// ============================================
router.get("/phases", async (req, res) => {
  try {
    const phases = await db
      .select()
      .from(growthPhases)
      .orderBy(growthPhases.phaseNumber);

    res.json(phases);
  } catch (error) {
    logger.error("Error fetching phases:", error);
    res.status(500).json({ error: "Failed to fetch phases" });
  }
});

// ============================================
// GET /api/growth-roadmap/phases/:id
// مرحلة محددة مع تفاصيلها
// ============================================
router.get("/phases/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const phase = await db
      .select()
      .from(growthPhases)
      .where(eq(growthPhases.id, id))
      .limit(1);

    if (!phase[0]) {
      return res.status(404).json({ error: "Phase not found" });
    }

    const weeks = await db
      .select()
      .from(growthWeeks)
      .where(eq(growthWeeks.phaseId, id))
      .orderBy(growthWeeks.weekNumber);

    const tasks = await db
      .select()
      .from(growthTasks)
      .where(eq(growthTasks.phaseId, id))
      .orderBy(growthTasks.dayNumber);

    res.json({
      ...phase[0],
      weeks,
      tasks,
    });
  } catch (error) {
    logger.error("Error fetching phase details:", error);
    res.status(500).json({ error: "Failed to fetch phase details" });
  }
});

// ============================================
// GET /api/growth-roadmap/weeks
// جميع الأسابيع
// ============================================
router.get("/weeks", async (req, res) => {
  try {
    const weeks = await db
      .select()
      .from(growthWeeks)
      .orderBy(growthWeeks.weekNumber);

    res.json(weeks);
  } catch (error) {
    logger.error("Error fetching weeks:", error);
    res.status(500).json({ error: "Failed to fetch weeks" });
  }
});

// ============================================
// GET /api/growth-roadmap/weeks/:id
// أسبوع محدد مع مهامه
// ============================================
router.get("/weeks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const week = await db
      .select()
      .from(growthWeeks)
      .where(eq(growthWeeks.id, id))
      .limit(1);

    if (!week[0]) {
      return res.status(404).json({ error: "Week not found" });
    }

    const tasks = await db
      .select()
      .from(growthTasks)
      .where(eq(growthTasks.weekId, id))
      .orderBy(growthTasks.dayNumber);

    res.json({
      ...week[0],
      tasks,
    });
  } catch (error) {
    logger.error("Error fetching week details:", error);
    res.status(500).json({ error: "Failed to fetch week details" });
  }
});

// ============================================
// GET /api/growth-roadmap/tasks
// جميع المهام (مع filters اختيارية)
// ============================================
router.get("/tasks", async (req, res) => {
  try {
    const { status, phaseId, weekId, category } = req.query;

    let query = db.select().from(growthTasks);

    if (status) {
      query = query.where(eq(growthTasks.status, status as string)) as any;
    }
    if (phaseId) {
      query = query.where(eq(growthTasks.phaseId, phaseId as string)) as any;
    }
    if (weekId) {
      query = query.where(eq(growthTasks.weekId, weekId as string)) as any;
    }
    if (category) {
      query = query.where(eq(growthTasks.category, category as string)) as any;
    }

    const tasks = await query.orderBy(growthTasks.dayNumber);

    res.json(tasks);
  } catch (error) {
    logger.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ============================================
// GET /api/growth-roadmap/tasks/:id
// مهمة محددة
// ============================================
router.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const task = await db
      .select()
      .from(growthTasks)
      .where(eq(growthTasks.id, id))
      .limit(1);

    if (!task[0]) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task[0]);
  } catch (error) {
    logger.error("Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// ============================================
// PATCH /api/growth-roadmap/tasks/:id
// تحديث حالة/تقدم مهمة
// ============================================
router.patch("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // إذا تم تغيير الحالة إلى "completed"، نضيف completedAt
    if (updates.status === "completed" && !updates.completedAt) {
      updates.completedAt = new Date();
    }

    // إذا تم تغيير الحالة إلى "in-progress"، نضيف startedAt
    if (updates.status === "in-progress" && !updates.startedAt) {
      const task = await db
        .select()
        .from(growthTasks)
        .where(eq(growthTasks.id, id))
        .limit(1);

      if (task[0] && !task[0].startedAt) {
        updates.startedAt = new Date();
      }
    }

    updates.updatedAt = new Date();

    const updatedTask = await db
      .update(growthTasks)
      .set(updates)
      .where(eq(growthTasks.id, id))
      .returning();

    if (!updatedTask[0]) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask[0]);
  } catch (error) {
    logger.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// ============================================
// POST /api/growth-roadmap/tasks
// إنشاء مهمة جديدة
// ============================================
router.post("/tasks", async (req, res) => {
  try {
    const taskData = req.body;

    const newTask = await db
      .insert(growthTasks)
      .values(taskData)
      .returning();

    res.status(201).json(newTask[0]);
  } catch (error) {
    logger.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// ============================================
// GET /api/growth-roadmap/today
// مهام اليوم
// ============================================
router.get("/today", async (req, res) => {
  try {
    // حساب رقم اليوم الحالي بناءً على تاريخ البدء
    // نفترض أن اليوم 1 هو 5 يناير 2026
    const startDate = new Date("2026-01-05");
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const currentDay = Math.min(diffDays, 90); // لا نتجاوز 90 يوم

    const todaysTasks = await db
      .select()
      .from(growthTasks)
      .where(eq(growthTasks.dayNumber, currentDay))
      .orderBy(growthTasks.priority);

    const inProgressTasks = await db
      .select()
      .from(growthTasks)
      .where(eq(growthTasks.status, "in-progress"))
      .orderBy(growthTasks.priority);

    res.json({
      currentDay,
      todaysTasks,
      inProgressTasks,
    });
  } catch (error) {
    logger.error("Error fetching today's tasks:", error);
    res.status(500).json({ error: "Failed to fetch today's tasks" });
  }
});

// ============================================
// POST /api/growth-roadmap/check-in
// تسجيل إنجاز يومي
// ============================================
router.post("/check-in", async (req, res) => {
  try {
    const checkInData = req.body;

    const newCheckIn = await db
      .insert(dailyCheckIns)
      .values({
        ...checkInData,
        date: new Date(),
      })
      .returning();

    res.status(201).json(newCheckIn[0]);
  } catch (error) {
    logger.error("Error creating check-in:", error);
    res.status(500).json({ error: "Failed to create check-in" });
  }
});

// ============================================
// GET /api/growth-roadmap/check-ins
// جميع التسجيلات اليومية
// ============================================
router.get("/check-ins", async (req, res) => {
  try {
    const { limit = "30" } = req.query;

    const checkIns = await db
      .select()
      .from(dailyCheckIns)
      .orderBy(desc(dailyCheckIns.date))
      .limit(parseInt(limit as string));

    res.json(checkIns);
  } catch (error) {
    logger.error("Error fetching check-ins:", error);
    res.status(500).json({ error: "Failed to fetch check-ins" });
  }
});

// ============================================
// POST /api/growth-roadmap/metrics
// إضافة قياسات جديدة
// ============================================
router.post("/metrics", async (req, res) => {
  try {
    const metricsData = req.body;

    // حساب النتيجة الإجمالية
    const totalScore = 
      (metricsData.technicalScore || 0) +
      (metricsData.businessScore || 0) +
      (metricsData.operationalScore || 0) +
      (metricsData.polishScore || 0);

    const newMetrics = await db
      .insert(growthMetrics)
      .values({
        ...metricsData,
        totalScore,
        date: new Date(),
      })
      .returning();

    res.status(201).json(newMetrics[0]);
  } catch (error) {
    logger.error("Error creating metrics:", error);
    res.status(500).json({ error: "Failed to create metrics" });
  }
});

// ============================================
// GET /api/growth-roadmap/metrics
// جميع القياسات
// ============================================
router.get("/metrics", async (req, res) => {
  try {
    const { limit = "30" } = req.query;

    const metrics = await db
      .select()
      .from(growthMetrics)
      .orderBy(desc(growthMetrics.date))
      .limit(parseInt(limit as string));

    res.json(metrics);
  } catch (error) {
    logger.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

// ============================================
// GET /api/growth-roadmap/metrics/latest
// أحدث قياس
// ============================================
router.get("/metrics/latest", async (req, res) => {
  try {
    const latestMetrics = await db
      .select()
      .from(growthMetrics)
      .orderBy(desc(growthMetrics.date))
      .limit(1);

    res.json(latestMetrics[0] || null);
  } catch (error) {
    logger.error("Error fetching latest metrics:", error);
    res.status(500).json({ error: "Failed to fetch latest metrics" });
  }
});

// ============================================
// GET /api/growth-roadmap/milestones
// جميع المعالم
// ============================================
router.get("/milestones", async (req, res) => {
  try {
    const milestones = await db
      .select()
      .from(growthMilestones)
      .orderBy(growthMilestones.targetDate);

    res.json(milestones);
  } catch (error) {
    logger.error("Error fetching milestones:", error);
    res.status(500).json({ error: "Failed to fetch milestones" });
  }
});

// ============================================
// PATCH /api/growth-roadmap/milestones/:id
// تحديث معلم
// ============================================
router.patch("/milestones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.status === "completed" && !updates.achievedAt) {
      updates.achievedAt = new Date();
    }

    const updatedMilestone = await db
      .update(growthMilestones)
      .set(updates)
      .where(eq(growthMilestones.id, id))
      .returning();

    if (!updatedMilestone[0]) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    res.json(updatedMilestone[0]);
  } catch (error) {
    logger.error("Error updating milestone:", error);
    res.status(500).json({ error: "Failed to update milestone" });
  }
});

// ============================================
// POST /api/growth-roadmap/initialize
// تهيئة البيانات الأولية للخطة من ملف MD
// ============================================
router.post("/initialize", async (req, res) => {
  try {
    // تحقق أولاً من وجود بيانات
    const existingPhases = await db.select().from(growthPhases);
    
    if (existingPhases.length > 0) {
      return res.status(400).json({ 
        error: "Data already initialized. Use /reset endpoint to reinitialize." 
      });
    }

    // المراحل الثلاث
    const phase1 = await db.insert(growthPhases).values({
      phaseNumber: 1,
      name: "Foundation",
      description: "Business plan, legal docs, pitch deck, demo video, production deployment",
      startWeek: 1,
      endWeek: 3,
      targetScore: 85,
      budget: "15000.00",
      status: "not-started",
    }).returning();

    const phase2 = await db.insert(growthPhases).values({
      phaseNumber: 2,
      name: "Traction",
      description: "Beta users, content marketing, first revenue, partnerships",
      startWeek: 4,
      endWeek: 8,
      targetScore: 90,
      budget: "15000.00",
      status: "not-started",
    }).returning();

    const phase3 = await db.insert(growthPhases).values({
      phaseNumber: 3,
      name: "Polish & Enterprise",
      description: "Enterprise features, infrastructure scale, Product Hunt, community",
      startWeek: 9,
      endWeek: 13,
      targetScore: 95,
      budget: "20000.00",
      status: "not-started",
    }).returning();

    // الأسابيع (نضيف بعض الأمثلة)
    const week1 = await db.insert(growthWeeks).values({
      phaseId: phase1[0].id,
      weekNumber: 1,
      name: "Business Foundation",
      description: "Business plan, legal docs, pitch deck Part 1",
      goals: JSON.stringify([
        "Complete business plan (15-20 pages)",
        "Financial model (3-year projections)",
        "LICENSE file",
        "Terms of Service",
        "Privacy Policy"
      ]),
      status: "not-started",
    }).returning();

    // المقاييس الأولية
    await db.insert(growthMetrics).values({
      date: new Date(),
      weekNumber: 0,
      totalUsers: 0,
      activeUsers: 0,
      mrr: "0",
      payingCustomers: 0,
      websiteVisitors: 0,
      technicalScore: 40,
      businessScore: 0,
      operationalScore: 10,
      polishScore: 7,
      totalScore: 72,
    });

    // بعض المعالم
    await db.insert(growthMilestones).values([
      {
        title: "First 10 Beta Users",
        description: "Onboard and activate first 10 beta testers",
        category: "users",
        targetValue: "10",
        targetDate: new Date("2026-01-25"),
        importance: "high",
      },
      {
        title: "First $1K MRR",
        description: "Reach $1,000 in monthly recurring revenue",
        category: "revenue",
        targetValue: "1000",
        targetDate: new Date("2026-02-15"),
        importance: "critical",
      },
      {
        title: "100 Active Users",
        description: "Reach 100 active users on the platform",
        category: "users",
        targetValue: "100",
        targetDate: new Date("2026-03-31"),
        importance: "high",
      },
    ]);

    res.json({ 
      success: true, 
      message: "Growth roadmap initialized successfully",
      phases: [phase1[0], phase2[0], phase3[0]],
    });
  } catch (error) {
    logger.error("Error initializing growth roadmap:", error);
    res.status(500).json({ error: "Failed to initialize growth roadmap" });
  }
});

// ============================================
// DELETE /api/growth-roadmap/reset
// إعادة تعيين جميع البيانات (خطير!)
// ============================================
router.delete("/reset", async (req, res) => {
  try {
    // حذف جميع البيانات بالترتيب الصحيح
    await db.delete(growthTasks);
    await db.delete(growthWeeks);
    await db.delete(growthPhases);
    await db.delete(dailyCheckIns);
    await db.delete(growthMetrics);
    await db.delete(growthMilestones);

    res.json({ success: true, message: "All growth roadmap data reset" });
  } catch (error) {
    logger.error("Error resetting growth roadmap:", error);
    res.status(500).json({ error: "Failed to reset growth roadmap" });
  }
});

export default router;
