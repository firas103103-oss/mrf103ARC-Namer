import { useEffect, useState } from "react";

export default function SelfCheck() {
  const [data, setData] = useState<any>({
    reminders: [],
    summaries: [],
    events: [],
  });
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState<number>(100);

  async function loadData() {
    try {
      const base = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const headers = { apikey: key, Authorization: `Bearer ${key}` };

      const [reminders, summaries, events] = await Promise.all([
        fetch(`${base}/rest/v1/ceo_reminders?select=*`, { headers }).then(r => r.json()),
        fetch(`${base}/rest/v1/executive_summaries?select=*`, { headers }).then(r => r.json()),
        fetch(`${base}/rest/v1/agent_events?select=*`, { headers }).then(r => r.json()),
      ]);

      setData({ reminders, summaries, events });

      // حساب الصحة بناءً على حجم البيانات وحداثتها
      const recentEvents = events.filter(
        (e: any) => new Date(e.created_at) > new Date(Date.now() - 3600 * 1000)
      ).length;
      const score = Math.min(100, 60 + recentEvents * 8);
      setHealthScore(score);

      setLoading(false);
    } catch (err) {
      console.error("❌ Error loading Supabase data:", err);
      setHealthScore(50);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // تحديث كل 10 ثوانٍ
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400 text-xl">
        جاري تحميل البيانات...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-green-400 mb-4 md:mb-0">
          ARC Self-Check Dashboard
        </h1>

        {/* Health Score */}
        <div
          className={`px-5 py-3 rounded-2xl text-lg font-semibold border ${
            healthScore > 85
              ? "text-green-300 border-green-600"
              : healthScore > 65
              ? "text-yellow-300 border-yellow-500"
              : "text-red-400 border-red-600"
          }`}
        >
          🩺 ARC Health Score: {healthScore}%
        </div>
      </header>

      <p className="text-gray-500 mb-6">
        مراقبة حية لحالة النظام، التذكيرات، الأحداث، والملخصات التنفيذية.
      </p>

      {/* تذكيرات CEO */}
      <section className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
        <h2 className="text-2xl text-green-300 mb-4">🗓️ تذكيرات CEO</h2>
        {data.reminders.length === 0 ? (
          <p className="text-gray-500">لا توجد تذكيرات حالياً</p>
        ) : (
          <ul className="space-y-3">
            {data.reminders.map((r: any) => (
              <li
                key={r.id}
                className="border-b border-gray-800 pb-2 hover:bg-gray-800/40 transition rounded-lg px-2"
              >
                <strong className="text-green-400">{r.title}</strong> —{" "}
                <span className="text-gray-400">
                  {new Date(r.due_date).toLocaleDateString("ar-SA")} ({r.priority})
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* الملخصات التنفيذية */}
      <section className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
        <h2 className="text-2xl text-green-300 mb-4">📊 الملخصات التنفيذية</h2>
        {data.summaries.length === 0 ? (
          <p className="text-gray-500">لا يوجد ملخصات بعد</p>
        ) : (
          <ul className="space-y-3">
            {data.summaries.map((s: any) => (
              <li
                key={s.id}
                className="border-b border-gray-800 pb-2 hover:bg-gray-800/40 transition rounded-lg px-2"
              >
                <span className="text-gray-400">
                  {new Date(s.generated_at).toLocaleString("ar-SA")}
                </span>
                <p className="text-green-200 mt-1 leading-relaxed">{s.summary_text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* أحداث الوكلاء */}
      <section className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
        <h2 className="text-2xl text-green-300 mb-4">🧠 أحداث الوكلاء</h2>
        {data.events.length === 0 ? (
          <p className="text-gray-500">لا يوجد نشاط للوكلاء بعد</p>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/40 scrollbar-track-gray-800/40">
            {data.events
              .slice()
              .reverse()
              .map((e: any) => (
                <li
                  key={e.id}
                  className="border-b border-gray-800 pb-2 hover:bg-gray-800/30 transition rounded-lg px-2"
                >
                  <strong className="text-green-400">{e.agent_name}</strong>{" "}
                  <span className="text-gray-500">({e.event_type})</span>
                  <p className="text-gray-300 text-sm mt-1">
                    {JSON.stringify(e.event_data)}
                  </p>
                  <span className="text-gray-500 text-xs">
                    {new Date(e.created_at).toLocaleTimeString("ar-SA")}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>

      <footer className="text-gray-600 text-sm pt-8 text-center border-t border-gray-800">
        ARC Virtual Office © {new Date().getFullYear()} – Mr.F Brain / Autonomous Layer v15.0
      </footer>
    </div>
  );
}
import SelfCheck from "./pages/SelfCheck";
<Route path="/selfcheck" element={<SelfCheck />} />