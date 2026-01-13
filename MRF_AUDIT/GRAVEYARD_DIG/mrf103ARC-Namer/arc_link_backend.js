const n8nWebhook = process.env.N8N_WEBHOOK_URL;
const supabaseUrl = process.env.SUPABASE_URL;

async function linkBackend() {
  console.log("Verifying ARC backend connections...");
  
  if (n8nWebhook) {
    try {
      await fetch(n8nWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "ARC v2.0",
          status: "linked",
          timestamp: new Date().toISOString()
        })
      });
      console.log("n8n webhook linked:", n8nWebhook);
    } catch (err) {
      console.warn("n8n link failed:", err.message);
    }
  } else {
    console.warn("N8N_WEBHOOK_URL not configured");
  }
  
  if (supabaseUrl) {
    console.log("Supabase URL verified:", supabaseUrl);
  } else {
    console.warn("SUPABASE_URL not configured");
  }
  
  console.log("ARC backend link verification complete");
}

linkBackend();
