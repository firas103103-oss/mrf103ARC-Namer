// مثال: عند إرسال رسالة لـ AI Agent
async function logAgentInteraction(agentId: string, success: boolean, durationMs: number) {
  await supabase.from("agent_interactions").insert([{
    agent_id: agentId,
    success,
    duration_ms: durationMs,
    created_at: new Date().toISOString()
  }]);
}

// مثال: كشف شذوذ تلقائي
async function detectAndLogAnomaly(agentId: string, type: string, severity: string) {
  await supabase.from("anomalies").insert([{
    agent_id: agentId,
    type,
    severity,
    description: `Automatic detection: ${type}`,
    detected_at: new Date().toISOString()
  }]);
}