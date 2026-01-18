#!/bin/bash
echo "🚀 Initializing ARC Level 13 – Reflex Intelligence Setup"

# 1️⃣ التحقق من وجود متغيرات البيئة
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "❌ Error: SUPABASE_URL or SUPABASE_KEY not found in environment."
  exit 1
fi

# 2️⃣ إنشاء الجداول في Supabase
echo "🧱 Creating Reflex Intelligence Tables..."

psql $SUPABASE_URL <<'SQL'
-- جدول الأحداث الخام من النظام
CREATE TABLE IF NOT EXISTS public.arc_reflex_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text,
  event_type text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- جدول التحليلات الذكية الناتجة
CREATE TABLE IF NOT EXISTS public.arc_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text,
  summary text,
  confidence numeric DEFAULT 0.95,
  created_at timestamptz DEFAULT now()
);
SQL

echo "✅ Tables arc_reflex_logs & arc_insights created successfully!"

# 3️⃣ إنشاء Edge Function (arc-reflex)
echo "⚙️ Setting up Supabase Edge Function – arc-reflex..."
mkdir -p supabase/functions/arc-reflex
cat > supabase/functions/arc-reflex/index.ts <<'EOF'
import { createClient } from "npm:@supabase/supabase-js@2.35.0";

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST allowed' }), { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const body = await req.json();
    console.log("🧠 ARC Reflex Event Received:", body);

    await supabase.from("arc_reflex_logs").insert([
      {
        source: body.source || "system",
        event_type: body.event_type || "unknown",
        payload: body
      }
    ]);

    // توليد Insight تلقائي مبسط
    const summary = `Reflex Insight: Event '${body.event_type}' from ${body.source}`;
    await supabase.from("arc_insights").insert([{ insight_type: "system_reflex", summary }]);

    return new Response(JSON.stringify({ success: true, message: summary }), { status: 200 });
  } catch (err) {
    console.error("❌ Reflex Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
EOF

echo "✅ Edge Function arc-reflex prepared."

# 4️⃣ إعداد واجهة Reflex Panel
mkdir -p src/pages
cat > src/pages/ReflexPanel.tsx <<'EOF'
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ReflexPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const logSub = supabase.channel("arc_reflex_logs")
      .on("postgres_changes", { event: "*", schema: "public", table: "arc_reflex_logs" }, fetchData)
      .subscribe();
    const insightSub = supabase.channel("arc_insights")
      .on("postgres_changes", { event: "*", schema: "public", table: "arc_insights" }, fetchData)
      .subscribe();
    return () => {
      supabase.removeChannel(logSub);
      supabase.removeChannel(insightSub);
    };
  }, []);

  const fetchData = async () => {
    const { data: l } = await supabase.from("arc_reflex_logs").select("*").order("created_at", { ascending: false }).limit(10);
    const { data: i } = await supabase.from("arc_insights").select("*").order("created_at", { ascending: false }).limit(10);
    setLogs(l || []);
    setInsights(i || []);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8">
      <h1 className="text-3xl font-bold text-green-400 mb-6">🧠 ARC Reflex Intelligence Panel</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-900 p-4 rounded-2xl">
          <h2 className="text-xl text-green-300 mb-3">Reflex Logs</h2>
          {logs.map((log) => (
            <div key={log.id} className="border-b border-gray-700 mb-2 pb-2">
              <p className="text-sm text-gray-300">Source: {log.source}</p>
              <p className="text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</p>
              <pre className="text-xs text-gray-500">{JSON.stringify(log.payload, null, 2)}</pre>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 p-4 rounded-2xl">
          <h2 className="text-xl text-green-300 mb-3">Generated Insights</h2>
          {insights.map((ins) => (
            <div key={ins.id} className="border-b border-gray-700 mb-2 pb-2">
              <p className="text-sm text-white">{ins.summary}</p>
              <p className="text-xs text-gray-500">{new Date(ins.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
EOF

echo "✅ Reflex Intelligence Panel created successfully!"

echo "🎯 ARC Level 13 Setup Complete!"
echo "Now deploy the Edge Function (arc-reflex) via Supabase CLI, then run your app."