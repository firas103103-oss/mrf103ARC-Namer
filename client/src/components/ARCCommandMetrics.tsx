import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ARCCommandMetrics() {
  const [metrics, setMetrics] = useState({
    total: 0,
    success: 0,
    failed: 0,
    avgResponse: 0,
  });

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // كل دقيقة
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data: commands } = await supabase
      .from("arc_command_log")
      .select("*")
      .gte("created_at", `${today}T00:00:00Z`)
      .lte("created_at", `${today}T23:59:59Z`);

    if (!commands) return;

    const total = commands.length;
    const success = commands.filter((c) => c.status === "completed").length;
    const failed = commands.filter((c) => c.status === "failed").length;
    const avgResponse = commands.reduce((acc, c) => acc + (c.duration_ms || 0), 0) / (total || 1);

    setMetrics({ total, success, failed, avgResponse });
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-md">
      <h2 className="text-xl font-semibold text-green-400 mb-4">📊 ARC Command Metrics</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white">{metrics.total}</p>
        </div>
        <div>
          <p className="text-gray-400">✅ Success</p>
          <p className="text-2xl font-bold text-green-400">{metrics.success}</p>
        </div>
        <div>
          <p className="text-gray-400">❌ Failed</p>
          <p className="text-2xl font-bold text-red-400">{metrics.failed}</p>
        </div>
        <div>
          <p className="text-gray-400">⚡ Avg (ms)</p>
          <p className="text-2xl font-bold text-blue-400">{Math.round(metrics.avgResponse)}</p>
        </div>
      </div>
    </div>
  );
}
