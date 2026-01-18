import { log } from "../index";

export async function addCeoReminder(title: string, dueDate: string, priority: string = "normal") {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      log("⚠️ Missing Supabase env vars for ceo_reminders", "reminders");
      return;
    }

    const body = {
      title,
      due_date: dueDate,
      priority,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/ceo_reminders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      log(`📅 Reminder added: ${title}`, "reminders");
    } else {
      log(`❌ Reminder insert failed (${res.status})`, "reminders");
    }
  } catch (err: any) {
    log(`❌ Reminder error: ${err.message}`, "reminders");
  }
}