import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import type { Socket } from "net";
import OpenAI from "openai";
import { checkRateLimit } from "./contracts";
import { supabase, isSupabaseConfigured } from "./supabase";

type IncomingChatMessage = {
  from?: string;
  free_text?: string;
  text?: string;
  type?: string;
};

const wss = new WebSocketServer({ noServer: true });

async function generateMrFReply(userText: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return `Mr.F (offline): I received: ${userText}`;
  }

  const client = new OpenAI({ apiKey });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are Mr.F, a single-operator ARC assistant. Respond concisely and clearly. Text-only.",
      },
      { role: "user", content: userText },
    ],
  });

  const text = completion.choices?.[0]?.message?.content;
  return (text || "").trim() || "Mr.F: (no response)";
}

async function tryLogChatInteraction(userText: string, assistantText: string) {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    await supabase.from("arc_command_log").insert([
      {
        command: "live_chat",
        payload: { userText, assistantText },
        status: "completed",
        source: "ws",
        created_at: new Date().toISOString(),
      },
    ]);
  } catch {
    // best-effort logging only
  }
}

wss.on("connection", (ws: WebSocket) => {
  ws.send(
    JSON.stringify({
      type: "connection_established",
      message: "Connected to realtime chat.",
    }),
  );

  ws.on("message", async (raw) => {
    try {
      if (!checkRateLimit("operator:chat", "chat_per_minute")) {
        ws.send(JSON.stringify({ type: "error", error: "rate_limited" }));
        return;
      }

      const parsed = JSON.parse(String(raw || "{}")) as IncomingChatMessage;
      const userText =
        (typeof parsed.free_text === "string" && parsed.free_text) ||
        (typeof parsed.text === "string" && parsed.text) ||
        "";

      const trimmed = userText.trim();
      if (!trimmed) return;

      const reply = await generateMrFReply(trimmed);
      ws.send(JSON.stringify({ type: "text", data: reply }));

      void tryLogChatInteraction(trimmed, reply);
    } catch (err: any) {
      ws.send(JSON.stringify({ type: "error", error: "bad_message" }));
    }
  });
});

export function handleRealtimeChatUpgrade(request: IncomingMessage, socket: Socket, head: Buffer) {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
}
