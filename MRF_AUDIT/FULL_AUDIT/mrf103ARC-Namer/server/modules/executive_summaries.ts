import { log } from "../index";

export async function storeExecutiveSummary(summaryText: string, sentiment: string = "positive", metrics: Record<string, any> = {}) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      log("⚠️ Missing Supabase vars for executive_summaries", "executive_summary");
      return;
    }

    const body = {
      summary_text: summaryText,
      generated_at: new Date().toISOString(),
      sentiment,
      metrics,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/executive_summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      log("📊 Executive summary stored successfully", "executive_summary");
    } else {
      log(`❌ Failed to store executive summary (${res.status})`, "executive_summary");
    }
  } catch (err: any) {
    log(`❌ Summary error: ${err.message}`, "executive_summary");
  }
}