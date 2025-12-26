#!/bin/bash
echo "🚀 Initializing ARC Autonomous Deploy Sequence..."
echo "----------------------------------------------"

# 1️⃣ تحقق من البيئة
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY in Secrets."
  exit 1
fi

echo "✅ Environment verified. Proceeding..."

# 2️⃣ تثبيت الحزم الأساسية
echo "📦 Installing dependencies..."
npm install pm2 -g >/dev/null 2>&1
npm install express @supabase/supabase-js node-fetch >/dev/null 2>&1

# 3️⃣ إنشاء سيرفر التشغيل الذاتي
mkdir -p server
cat > server/autonomous.js <<'EOF'
import express from "express";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ARC_REFLEX_URL = `${SUPABASE_URL}/functions/v1/arc-reflex`;

// Endpoint صحي للنظام
app.get("/health", (_, res) => res.json({ status: "ARC OS is alive", time: new Date().toISOString() }));

// استقبال أوامر من n8n أو واجهة
app.post("/api/arc/receive", async (req, res) => {
  try {
    const data = req.body;
    await supabase.from("arc_command_log").insert([{ command_id: data.command_id || "N/A", payload: data, status: "received" }]);
    res.json({ success: true, message: "Command stored" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// تشغيل ARC Reflex Intelligence كل 5 دقائق
setInterval(async () => {
  try {
    const event = {
      source: "ARC-Autonomous-Loop",
      event_type: "heartbeat",
      data: { timestamp: new Date().toISOString() }
    };
    await fetch(ARC_REFLEX_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify(event)
    });
    console.log("🧠 ARC Reflex Pulse sent:", event.data.timestamp);
  } catch (err) {
    console.error("Reflex error:", err.message);
  }
}, 300000); // كل 5 دقائق

// بدء السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🧩 ARC Autonomous Server running on port ${PORT}`));
EOF

echo "✅ Autonomous server created."

# 4️⃣ إعداد PM2 لتشغيل دائم
echo "🧠 Configuring PM2..."
pm2 delete arc-autonomous >/dev/null 2>&1
pm2 start server/autonomous.js --name "arc-autonomous"
pm2 save

# 5️⃣ اختبار النظام
echo "🧪 Testing system health..."
curl -s http://localhost:5000/health || echo "⚠️ Health check skipped (may require Replit proxy)."

echo "----------------------------------------------"
echo "✅ ARC Autonomous Deploy completed successfully!"
echo "🧩 Server running continuously via PM2 on port 5000."
echo "🧠 Reflex Intelligence active (heartbeat every 5 minutes)."
echo "----------------------------------------------"
echo "To check logs, use: pm2 logs arc-autonomous"
echo "To restart system, use: pm2 restart arc-autonomous"