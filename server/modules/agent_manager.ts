/**
 * ═══════════════════════════════════════════════════════════════
 * ARC AGENT MANAGER
 * ═══════════════════════════════════════════════════════════════
 * نظام شامل لإدارة الوكلاء (Agents):
 * - إدارة المهام (Tasks)
 * - التحليل والتعلم (Learning & Analysis)
 * - مراقبة الأداء (Performance Monitoring)
 * - تنسيق العمل بين الوكلاء
 * ═══════════════════════════════════════════════════════════════
 */

import { supabase, isSupabaseConfigured } from "../supabase";
import { log } from "../index";
import { sendToN8N } from "./integration_manager";

// ═══════════════════════════════════════════════════════════════
// TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export interface TaskInput {
  agentId: string;
  taskType: "analysis" | "research" | "communication" | "monitoring" | "execution";
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  input?: Record<string, any>;
  dueDate?: string;
  assignedBy?: string;
  dependencies?: string[];
  estimatedDurationMs?: number;
}

export async function createTask(taskInput: TaskInput): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase!
      .from("agent_tasks")
      .insert({
        agent_id: taskInput.agentId,
        task_type: taskInput.taskType,
        title: taskInput.title,
        description: taskInput.description,
        priority: taskInput.priority || "medium",
        status: "pending",
        progress: 0,
        assigned_by: taskInput.assignedBy || "system",
        dependencies: taskInput.dependencies || [],
        input: taskInput.input || {},
        estimated_duration_ms: taskInput.estimatedDurationMs,
        due_date: taskInput.dueDate,
      })
      .select()
      .single();

    if (error) {
      log(`❌ Failed to create task: ${error.message}`, "agent_manager");
      return null;
    }

    log(`✅ Task created for ${taskInput.agentId}: ${taskInput.title}`, "agent_manager");

    // Notify agent via n8n
    await sendToN8N({
      event_type: "task_assigned",
      agent_id: taskInput.agentId,
      data: {
        task_id: data.id,
        task_type: taskInput.taskType,
        title: taskInput.title,
        priority: taskInput.priority,
      },
      priority: taskInput.priority === "critical" ? "critical" : "normal",
    });

    return data.id;
  } catch (err: any) {
    log(`❌ Task creation error: ${err.message}`, "agent_manager");
    return null;
  }
}

export async function updateTaskStatus(
  taskId: string,
  status: "pending" | "in_progress" | "completed" | "failed" | "blocked",
  progress?: number,
  output?: Record<string, any>,
  errorMessage?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const updates: Record<string, any> = { status, progress };

    if (status === "in_progress" && !updates.started_at) {
      updates.started_at = new Date().toISOString();
    }

    if (status === "completed" || status === "failed") {
      updates.completed_at = new Date().toISOString();
      
      // Calculate actual duration
      const { data: task } = await supabase!
        .from("agent_tasks")
        .select("started_at")
        .eq("id", taskId)
        .single();

      if (task?.started_at) {
        const startTime = new Date(task.started_at).getTime();
        const endTime = new Date().getTime();
        updates.actual_duration_ms = endTime - startTime;
      }
    }

    if (output) updates.output = output;
    if (errorMessage) updates.error_message = errorMessage;

    const { error } = await supabase!
      .from("agent_tasks")
      .update(updates)
      .eq("id", taskId);

    if (error) {
      log(`❌ Failed to update task: ${error.message}`, "agent_manager");
      return false;
    }

    log(`✅ Task ${taskId} updated: ${status} (${progress}%)`, "agent_manager");
    return true;
  } catch (err: any) {
    log(`❌ Task update error: ${err.message}`, "agent_manager");
    return false;
  }
}

export async function getAgentTasks(
  agentId: string,
  filters?: {
    status?: string;
    priority?: string;
    limit?: number;
  }
): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase!.from("agent_tasks").select("*").eq("agent_id", agentId);

    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.priority) query = query.eq("priority", filters.priority);
    if (filters?.limit) query = query.limit(filters.limit);

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      log(`❌ Failed to fetch tasks: ${error.message}`, "agent_manager");
      return [];
    }

    return data || [];
  } catch (err: any) {
    log(`❌ Task fetch error: ${err.message}`, "agent_manager");
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// LEARNING & ANALYSIS
// ═══════════════════════════════════════════════════════════════

export interface LearningInput {
  agentId: string;
  learningType: "pattern_recognition" | "performance_optimization" | "user_preference" | "error_correction";
  context?: string;
  inputData?: Record<string, any>;
  analysis?: Record<string, any>;
  insights?: string[];
  confidence?: number;
}

export async function recordLearning(learningInput: LearningInput): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase!
      .from("agent_learning")
      .insert({
        agent_id: learningInput.agentId,
        learning_type: learningInput.learningType,
        context: learningInput.context,
        input_data: learningInput.inputData || {},
        analysis: learningInput.analysis || {},
        insights: learningInput.insights || [],
        confidence: learningInput.confidence || 50,
        applied: "false",
      })
      .select()
      .single();

    if (error) {
      log(`❌ Failed to record learning: ${error.message}`, "agent_manager");
      return null;
    }

    log(`✅ Learning recorded for ${learningInput.agentId}: ${learningInput.learningType}`, "agent_manager");
    return data.id;
  } catch (err: any) {
    log(`❌ Learning record error: ${err.message}`, "agent_manager");
    return null;
  }
}

export async function applyLearning(
  learningId: string,
  validatedBy: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase!
      .from("agent_learning")
      .update({
        applied: "true",
        applied_at: new Date().toISOString(),
        validated_by: validatedBy,
        validated_at: new Date().toISOString(),
      })
      .eq("id", learningId);

    if (error) {
      log(`❌ Failed to apply learning: ${error.message}`, "agent_manager");
      return false;
    }

    log(`✅ Learning ${learningId} applied by ${validatedBy}`, "agent_manager");
    return true;
  } catch (err: any) {
    log(`❌ Learning application error: ${err.message}`, "agent_manager");
    return false;
  }
}

export async function getAgentLearning(
  agentId: string,
  filters?: {
    learningType?: string;
    applied?: boolean;
    limit?: number;
  }
): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase!.from("agent_learning").select("*").eq("agent_id", agentId);

    if (filters?.learningType) query = query.eq("learning_type", filters.learningType);
    if (filters?.applied !== undefined) {
      query = query.eq("applied", filters.applied ? "true" : "false");
    }
    if (filters?.limit) query = query.limit(filters.limit);

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      log(`❌ Failed to fetch learning data: ${error.message}`, "agent_manager");
      return [];
    }

    return data || [];
  } catch (err: any) {
    log(`❌ Learning fetch error: ${err.message}`, "agent_manager");
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE MONITORING
// ═══════════════════════════════════════════════════════════════

export interface PerformanceMetric {
  agentId: string;
  metricType: "response_time" | "success_rate" | "task_completion" | "quality_score";
  value: number;
  unit?: string;
  context?: Record<string, any>;
  periodStart?: string;
  periodEnd?: string;
}

export async function recordPerformance(metric: PerformanceMetric): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { error } = await supabase!.from("agent_performance").insert({
      agent_id: metric.agentId,
      metric_type: metric.metricType,
      value: metric.value.toString(),
      unit: metric.unit,
      context: metric.context || {},
      period_start: metric.periodStart,
      period_end: metric.periodEnd,
    });

    if (error) {
      log(`❌ Failed to record performance: ${error.message}`, "agent_manager");
      return false;
    }

    return true;
  } catch (err: any) {
    log(`❌ Performance record error: ${err.message}`, "agent_manager");
    return false;
  }
}

export async function getAgentPerformance(
  agentId: string,
  metricType?: string,
  limit: number = 100
): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase!.from("agent_performance").select("*").eq("agent_id", agentId);

    if (metricType) query = query.eq("metric_type", metricType);

    query = query.order("recorded_at", { ascending: false }).limit(limit);

    const { data, error } = await query;

    if (error) {
      log(`❌ Failed to fetch performance data: ${error.message}`, "agent_manager");
      return [];
    }

    return data || [];
  } catch (err: any) {
    log(`❌ Performance fetch error: ${err.message}`, "agent_manager");
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// AGENT ANALYTICS
// ═══════════════════════════════════════════════════════════════

export async function getAgentAnalytics(agentId: string): Promise<Record<string, any>> {
  if (!isSupabaseConfigured()) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageCompletionTime: 0,
      successRate: 0,
      learningCount: 0,
      appliedLearnings: 0,
    };
  }

  try {
    // Fetch task statistics
    const { data: tasks } = await supabase!
      .from("agent_tasks")
      .select("status, actual_duration_ms")
      .eq("agent_id", agentId);

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter((t) => t.status === "completed").length || 0;
    const failedTasks = tasks?.filter((t) => t.status === "failed").length || 0;
    const successRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const completedWithDuration = tasks?.filter(
      (t) => t.status === "completed" && t.actual_duration_ms
    );
    const averageCompletionTime =
      completedWithDuration && completedWithDuration.length > 0
        ? completedWithDuration.reduce((sum, t) => sum + t.actual_duration_ms, 0) /
          completedWithDuration.length
        : 0;

    // Fetch learning statistics
    const { data: learnings } = await supabase!
      .from("agent_learning")
      .select("applied")
      .eq("agent_id", agentId);

    const learningCount = learnings?.length || 0;
    const appliedLearnings = learnings?.filter((l) => l.applied === "true").length || 0;

    return {
      totalTasks,
      completedTasks,
      failedTasks,
      averageCompletionTime: Math.round(averageCompletionTime),
      successRate: Math.round(successRate * 100) / 100,
      learningCount,
      appliedLearnings,
      learningApplicationRate:
        learningCount > 0
          ? Math.round((appliedLearnings / learningCount) * 100 * 100) / 100
          : 0,
    };
  } catch (err: any) {
    log(`❌ Analytics fetch error: ${err.message}`, "agent_manager");
    return {};
  }
}
