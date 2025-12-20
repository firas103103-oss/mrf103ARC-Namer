import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface ReflexEvent {
  id: string;
  source: string;
  event_type: string;
  created_at: string;
}

export default function ARCMonitor() {
  const [status, setStatus] = useState({
    server: "Checking...",
    supabase: "Checking...",
    lastHeartbeat: "—",
  });
  const [reflex, setReflex] = useState<ReflexEvent[]>([]);

  // 🔁 Fetch statuses
  useEffect(() => {
    checkServerHealth();
    checkSupabase();
    loadReflex();

    const interval = setInterval(() => {
      checkServerHealth();
      loadReflex();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const checkServerHealth = async () => {
    try {
      const res = await fetch("/health");
      if (res.ok) {
        const json = await res.json();
        setStatus((s) => ({ ...s, server: "✅ Active", lastHeartbeat: json.time }));
      } else setStatus((s) => ({ ...s, server: "⚠️ Unreachable" }));
    } catch {
      setStatus((s) => ({ ...s, server: "❌ Offline" }));
    }
  };

  const checkSupabase = async () => {
    try {
      const { data, error } = await supabase.from("arc_reflex_logs").select("*").limit(1);
      if (error) throw error;
      setStatus((s) => ({ ...s, supabase: "✅ Connected" }));
    } catch {
      setStatus((s) => ({ ...s, supabase: "❌ Error" }));
    }
  };

  const loadReflex = async () => {
    const { data } = await supabase
      .from("arc_reflex_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setReflex(data);
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-md">
      <h2 className="text-xl font-semibold text-green-400 mb-4">🧩 ARC Monitor</h2>

      <div className="space-y-2 text-sm">
        <p>🖥️ <strong>Server:</strong> {status.server}</p>
        <p>💾 <strong>Supabase:</strong> {status.supabase}</p>
        <p>🩺 <strong>Last Heartbeat:</strong> {status.lastHeartbeat}</p>
      </div>

      <hr className="my-4 border-gray-700" />

      <h3 className="text-lg text-green-300 mb-2">🧠 Recent Reflex Events</h3>
      {reflex.length === 0 ? (
        <p className="text-gray-500 text-sm">No reflex events yet.</p>
      ) : (
        <ul className="space-y-2 text-xs text-gray-400">
          {reflex.map((r) => (
            <li key={r.id} className="border-b border-gray-800 pb-1">
              <span className="text-green-400">{r.event_type}</span> from{" "}
              <span className="text-gray-300">{r.source}</span>
              <br />
              <span className="text-gray-500">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
