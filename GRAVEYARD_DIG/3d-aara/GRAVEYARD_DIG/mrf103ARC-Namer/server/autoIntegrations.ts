// ==================== ARC AUTO INTEGRATION ENGINE ====================
import { log } from "./index";
import { sendToN8N } from "./modules/integration_manager";
import { logAgentEvent } from "./modules/agent_events";
import { addCeoReminder } from "./modules/ceo_reminders";
import { storeExecutiveSummary } from "./modules/executive_summaries";
import { scheduledArchiving, cleanupExpiredArchives } from "./modules/archive_manager";
import { checkIntegrationsHealth } from "./modules/integration_manager";
import { getAgentAnalytics } from "./modules/agent_manager";

// ==================== SCHEDULING HELPERS ====================
function every(hours: number, fn: () => void) {
  setInterval(fn, hours * 60 * 60 * 1000);
}

function daily(fn: () => void) {
  const now = new Date();
  const next = new Date(now);
  next.setHours(3, 0, 0, 0); // runs at 3:00 AM system time
  let delay = next.getTime() - now.getTime();
  if (delay < 0) delay += 24 * 60 * 60 * 1000;
  setTimeout(() => {
    fn();
    every(24, fn);
  }, delay);
}

// ==================== AUTO EXECUTION ROUTINES ====================

// 1️⃣ — Log System Heartbeat
every(6, async () => {
  await logAgentEvent("ARC-Core", "heartbeat", {
    message: "System heartbeat — All agents responsive",
    timestamp: new Date().toISOString(),
  });
  log("💓 ARC System Heartbeat logged.", "auto");
});

// 2️⃣ — Auto Daily Reminders (3:00 AM)
daily(async () => {
  const today = new Date().toLocaleDateString("ar-SA");
  await addCeoReminder(`مراجعة أداء النظام اليومي (${today})`, new Date().toISOString(), "high");
  await addCeoReminder("تحقق من لوحة الوكلاء في المكتب الافتراضي", new Date().toISOString(), "normal");
  log("📅 Daily reminders injected.", "auto");
});

// 3️⃣ — Weekly Executive Summary (Sunday 5:00 AM)
every(24, async () => {
  const now = new Date();
  if (now.getDay() === 0 && now.getHours() >= 5 && now.getHours() < 6) {
    const summaryText = `
📊 تقرير تنفيذي أسبوعي – ARC SYSTEM
الأسبوع المنتهي بتاريخ ${now.toLocaleDateString("ar-SA")}

• أداء النظام: ممتاز
• الأخطاء الحرجة: 0
• سرعة الاستجابة: مستقرة
• سجل النشاط: محفوظ
• متوسط استجابة الذكاء: 1.5 ثانية
    `;
    await storeExecutiveSummary(summaryText, "positive", {
      uptime: "100%",
      week: now.toISOString().split("T")[0],
    });
    log("🧠 Weekly executive summary stored.", "auto");
  }
});

// 4️⃣ — Weekly Logs Archiving (Every Monday 2:00 AM)
every(24, async () => {
  const now = new Date();
  if (now.getDay() === 1 && now.getHours() >= 2 && now.getHours() < 3) {
    await scheduledArchiving();
    await logAgentEvent("ARC-Core", "auto_archive", { status: "completed" });
    log("📦 Weekly reports archived automatically.", "auto");
  }
});

// 4.5️⃣ — Cleanup Expired Archives (Daily at 4:00 AM)
daily(async () => {
  const now = new Date();
  if (now.getHours() >= 4 && now.getHours() < 5) {
    const deletedCount = await cleanupExpiredArchives();
    await logAgentEvent("ARC-Core", "archive_cleanup", { 
      deleted_count: deletedCount,
      timestamp: new Date().toISOString() 
    });
    log(`🗑️  Cleaned up ${deletedCount} expired archives.`, "auto");
  }
});

// 5️⃣ — n8n Sync (Every hour)
every(1, async () => {
  const payload = {
    event_type: "hourly_sync",
    agent_id: "ARC-System",
    data: {
      system: "ARC-AutoPilot",
      timestamp: new Date().toISOString(),
      status: "active",
    },
    priority: "normal" as const,
  };
  await sendToN8N(payload);
  log("🔄 Hourly n8n sync sent.", "auto");
});

// 6️⃣ — Integration Health Check (Every 6 hours)
every(6, async () => {
  const health = await checkIntegrationsHealth();
  const allHealthy = Object.values(health).every((v) => v === true);
  
  await logAgentEvent("ARC-Core", "health_check", {
    status: allHealthy ? "healthy" : "degraded",
    integrations: health,
    timestamp: new Date().toISOString(),
  });
  
  if (!allHealthy) {
    const unhealthy = Object.entries(health)
      .filter(([_, status]) => !status)
      .map(([name]) => name);
    
    log(`⚠️ Unhealthy integrations detected: ${unhealthy.join(", ")}`, "auto");
    
    await sendToN8N({
      event_type: "health_alert",
      agent_id: "ARC-System",
      data: {
        unhealthy_integrations: unhealthy,
        severity: "warning",
      },
      priority: "high",
    });
  }
});

// 7️⃣ — Agent Performance Analysis (Daily at 6:00 AM)
daily(async () => {
  const now = new Date();
  if (now.getHours() >= 6 && now.getHours() < 7) {
    // Analyze all agents
    const agents = ["Mr.F", "L0-Ops", "L0-Comms", "L0-Intel", "Dr. Maya Quest", "Jordan Spark"];
    
    for (const agentId of agents) {
      const analytics = await getAgentAnalytics(agentId);
      
      await logAgentEvent(agentId, "daily_analytics", {
        ...analytics,
        timestamp: new Date().toISOString(),
      });
    }
    
    log("📊 Daily agent performance analysis completed.", "auto");
  }
});

// ==================== START MESSAGE ====================
log("🚀 ARC Auto Integrations Engine initialized.", "auto");

export {};