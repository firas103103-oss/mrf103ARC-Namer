import { useEffect, useState } from "react";

export default function VoiceChatRealtime() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [text, setText] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}/realtime`);

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "text") {
        setLogs((l) => [...l, msg.data]);
      } else if (msg.type === "audio") {
        const audio = new Audio(`data:audio/mpeg;base64,${msg.data}`);
        audio.play();
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const send = () => {
    if (!socket) return;
    socket.send(JSON.stringify({ from: "L0-Comms", free_text: text }));
    setText("");
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
      <h2 className="text-green-400 text-lg mb-2 font-semibold">
        Realtime Voice Chat 🎙️
      </h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 bg-gray-800 text-white rounded-lg mb-2"
        rows={3}
        placeholder="اكتب شيئاً..."
      />
      <button
        onClick={send}
        className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg font-semibold"
      >
        إرسال 🎤
      </button>

      <div className="text-sm text-gray-300 mt-3 space-y-1 overflow-y-auto max-h-60">
        {logs.map((t, i) => (
          <div key={i}>{t}</div>
        ))}
      </div>
    </div>
  );
}