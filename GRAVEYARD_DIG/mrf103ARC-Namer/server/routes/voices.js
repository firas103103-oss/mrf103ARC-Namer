/* eslint-disable no-undef */
import express from "express";

const router = express.Router();

router.get("/api/arc/voices", async (_req, res) => {
  try {
    const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVEN_KEY)
      return res.status(500).json({ error: "Missing ELEVENLABS_API_KEY" });

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": ELEVEN_KEY },
    });
    const data = await response.json();

    const voices = data.voices.map((v) => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category,
    }));

    res.json({ voices });
  } catch (err) {
    console.error("Voice list error:", err);
    res.status(500).json({ error: "Failed to fetch voices" });
  }
});

export default router;