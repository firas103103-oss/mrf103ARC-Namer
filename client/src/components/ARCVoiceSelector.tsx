import { useEffect, useState } from "react";

interface VoiceOption {
  voice_id: string;
  name: string;
  category?: string;
}

export default function ARCVoiceSelector() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    localStorage.getItem("arc_selected_voice") || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/arc/voices");
      const data = await res.json();
      setVoices(data.voices || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch voices:", err);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedVoice(value);
    localStorage.setItem("arc_selected_voice", value);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-md">
      <h2 className="text-xl font-semibold text-green-400 mb-3">
        🎚️ ARC Voice Selector
      </h2>

      {loading ? (
        <p className="text-gray-400">Loading voices...</p>
      ) : (
        <select
          value={selectedVoice}
          onChange={handleChange}
          className="bg-gray-800 text-gray-100 p-2 rounded-lg w-full text-sm border border-gray-700"
        >
          <option value="">Select a voice...</option>
          {voices.map((v) => (
            <option key={v.voice_id} value={v.voice_id}>
              {v.name} {v.category ? `(${v.category})` : ""}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}