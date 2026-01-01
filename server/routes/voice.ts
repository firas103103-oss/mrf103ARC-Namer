import { Router, Request, Response } from "express";

const voiceRouter = Router();

/**
 * POST /api/voice/synthesize
 * Convert text to speech using ElevenLabs
 * 
 * ADR-002: Voice Synthesis Layer (v0.2)
 */
voiceRouter.post(
  "/synthesize",
  async (req: Request, res: Response) => {
    try {
      const { text, voice_id = "default", model = "eleven_monolingual_v1" } = req.body;

      // Validate input
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "text is required and must be a string" });
      }

      if (text.length > 5000) {
        return res.status(400).json({ error: "text must be under 5000 characters" });
      }

      // Check ElevenLabs API key
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ 
          error: "Voice synthesis unavailable",
          reason: "ElevenLabs API key not configured"
        });
      }

      // Call ElevenLabs API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: model,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({
          error: "ElevenLabs API error",
          details: error,
        });
      }

      // Stream audio directly to client
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=3600");
      
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));

    } catch (error) {
      console.error("[Voice Synthesis Error]", error);
      res.status(500).json({ 
        error: "Voice synthesis failed",
        reason: error instanceof Error ? error.message : "unknown error"
      });
    }
  }
);

export default voiceRouter;
