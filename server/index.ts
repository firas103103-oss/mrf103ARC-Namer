// ==================== IMPORTS ====================
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import fs from "fs";
import path from "path";

// ==================== SERVER BASE ====================
const app = express();
const httpServer = createServer(app);
app.use(cors());
app.use(express.json());

// ==================== LOGGER ====================
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// ==================== VOICE MAP LOADING ====================
const voiceMapPath = path.join(process.cwd(), "server", "config", "voiceMap.json");
let voiceMap: Record<string, string> = {};
try {
  const jsonData = fs.readFileSync(voiceMapPath, "utf-8");
  voiceMap = JSON.parse(jsonData);
  log("🎙️ VoiceMap loaded successfully", "init");
} catch (err: any) {
  log("⚠️ Could not load voiceMap.json, using default voice", "init");
  voiceMap = { default: "pNInz6obpgDQGcFmaJgB" };
}

// ==================== SECURITY PLACEHOLDER ====================
let unauthorizedAttempts = 0;
let lastUnauthorizedPath = "";

// ==================== HEALTH CHECK ====================
app.get("/ping", (_req: Request, res: Response) => {
  res.json({ status: "alive", message: "✅ ARC Bridge Server is running" });
});

// ==================== ARC VOICE + GPT BRAIN ENDPOINT ====================
app.post("/api/call_mrf_brain", async (req: Request, res: Response) => {
  try {
    const { from, free_text } = req.body;
    log(`Incoming ARC voice-call from ${from} :: ${free_text}`, "bridge");

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!OPENAI_KEY) throw new Error("Missing OPENAI_API_KEY");
    if (!ELEVEN_KEY) throw new Error("Missing ELEVENLABS_API_KEY");

    // 1️⃣ Step 1 – Generate response text using GPT
    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Mr.F Brain — the executive AI agent of ARC Virtual Office. Respond in concise, intelligent Arabic.",
          },
          { role: "user", content: free_text },
        ],
      }),
    });

    const gptData = await gptRes.json();
    const answer =
      gptData.choices?.[0]?.message?.content || "لم أتمكن من فهم الطلب.";

    // 2️⃣ Step 2 – Select Voice based on agent
    const agentName = from || "default";
    const VOICE_ID =
      voiceMap[agentName] || process.env.MRF_VOICE_ID || voiceMap["default"];

    // 3️⃣ Step 3 – Generate voice using ElevenLabs
    let audioBuffer: Buffer | null = null;
    try {
      const voiceResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVEN_KEY,
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: answer,
            voice_settings: { stability: 0.7, similarity_boost: 0.8 },
          }),
        }
      );

      if (voiceResponse.ok) {
        audioBuffer = Buffer.from(await voiceResponse.arrayBuffer());
        log(`🎧 Voice synthesis complete for ${agentName}`, "voice");
      } else {
        log(`⚠️ ElevenLabs error: ${voiceResponse.status}`, "voice");
      }
    } catch (err: any) {
      log(`❌ ElevenLabs connection failed: ${err.message}`, "voice");
    }

    // 4️⃣ Step 4 – Log to Supabase (optional)
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/arc_logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            from,
            free_text,
            gpt_response: answer,
            status: "completed",
            created_at: new Date().toISOString(),
          }),
        });
      } catch (e: any) {
        log(`⚠️ Failed to log to Supabase: ${e.message}`, "supabase");
      }
    }

    // 5️⃣ Step 5 – Respond with text + voice
    res.setHeader("Content-Type", "application/json");
    res.json({
      status: "ok",
      from,
      reply: answer,
      voice: audioBuffer
        ? `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`
        : null,
      timestamp: new Date().toISOString(),
    });

    log(`✅ Voice+Brain response sent to ${from}`, "bridge");
  } catch (err: any) {
    console.error("ARC Voice Brain Error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==================== ERROR HANDLER ====================
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  log(`Error: ${message}`, "error");
});

// ==================== START SERVER ====================
const PORT = parseInt(process.env.PORT || "5000", 10);
httpServer.listen(
  {
    port: PORT,
    host: "0.0.0.0",
    reusePort: true,
  },
  () => {
    log(`✅ ARC Bridge Server running on port ${PORT}`);
  }
);