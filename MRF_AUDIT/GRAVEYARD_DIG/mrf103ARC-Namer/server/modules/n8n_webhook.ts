import { log } from "../index";

export async function sendToN8N(payload: Record<string, any>) {
  try {
    const N8N_URL = process.env.N8N_WEBHOOK_URL;
    const ARC_SECRET = process.env.ARC_BACKEND_SECRET;

    if (!N8N_URL) {
      log("⚠️ N8N_WEBHOOK_URL not set", "n8n");
      return;
    }

    const res = await fetch(N8N_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-arc-secret": ARC_SECRET || "",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      log("🔄 Data successfully sent to n8n webhook", "n8n");
    } else {
      const errText = await res.text();
      log(`❌ n8n Webhook error: ${res.status} ${errText}`, "n8n");
    }
  } catch (err: any) {
    log(`❌ Failed to connect to n8n: ${err.message}`, "n8n");
  }
}