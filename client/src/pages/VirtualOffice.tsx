import { useState } from "react";
import VoiceChatRealtime from "../components/VoiceChatRealtime";

const agents = [
  { name: "Mr.F", role: "Executive Brain" },
  { name: "L0-Comms", role: "Communications Director" },
  { name: "L0-Ops", role: "Operations Commander" },
  { name: "L0-Intel", role: "Intelligence Analyst" },
  { name: "Dr. Maya Quest", role: "Research Analyst" },
  { name: "Jordan Spark", role: "Creative Director" }
];

export default function VirtualOffice() {
  const [loading, setLoading] = useState<string | null>(null);

  const playVoice = async (agent: string) => {
    try {
      setLoading(agent);
      const res = await fetch("/api/call_mrf_brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: agent,
          free_text: `مرحباً، أنا ${agent}. سعيدة بالتحدث معك في مكتب ARC الافتراضي.`
        })
      });
      const data = await res.json();
      if (data.voice) {
        const audio = new Audio(data.voice);
        audio.play();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 space-y-8">
      <h1 className="text-3xl font-bold text-green-400 mb-8">
        ARC Virtual Office – Multi-Agent Voices
      </h1>

      {/* 🟢 Section 1: Voice Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((a) => (
          <div
            key={a.name}
            className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-md"
          >
            <h2 className="text-xl font-semibold text-green-300">{a.name}</h2>
            <p className="text-gray-500 text-sm mb-3">{a.role}</p>
            <button
              onClick={() => playVoice(a.name)}
              disabled={loading === a.name}
              className={`px-4 py-2 rounded-lg font-semibold ${
                loading === a.name
                  ? "bg-gray-700 text-gray-400"
                  : "bg-green-500 hover:bg-green-600 text-black"
              }`}
            >
              {loading === a.name ? "جاري التحضير..." : "🔊 اسمع الصوت"}
            </button>
          </div>
        ))}
      </div>

      {/* 🟢 Section 2: Realtime Voice Chat */}
      <div className="pt-8">
        <VoiceChatRealtime />
      </div>
    </div>
  );
}