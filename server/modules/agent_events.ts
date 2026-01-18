import { log } from "../index";

export async function logAgentEvent(agentName: string, eventType: string, eventData: Record<string, any>) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      log("⚠️ Supabase credentials missing for agent_events", "agent_events");
      return;
    }

    const payload = {
      agent_name: agentName,
      event_type: eventType,
      event_data: eventData,
      created_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/agent_events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      log(`📡 Agent event logged for ${agentName} (${eventType})`, "agent_events");
    } else {
      const errText = await res.text();
      log(`❌ Failed to log agent event: ${res.status} ${errText}`, "agent_events");
    }
  } catch (err: any) {
    log(`❌ Agent event error: ${err.message}`, "agent_events");
  }
}