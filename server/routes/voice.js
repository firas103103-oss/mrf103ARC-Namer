import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.post("/api/arc/voice", async (req, res) => {
  try {
    const { text, voice_id = "pNInz6obpgDQGcFmaJgB" } = req.body; // default: Adam
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing ELEVENLABS_API_KEY" });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          voice_settings: { stability: 0.7, similarity_boost: 0.8 },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `voice_${Date.now()}.mp3`;
    const filepath = path.join("/tmp", filename);
    fs.writeFileSync(filepath, buffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error("Voice API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
