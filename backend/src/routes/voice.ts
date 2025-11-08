import { Router } from "express";
import { textToSpeech } from "../services/elevenlabs.js";

const router = Router();

// Note: Transcription is handled client-side using Web Speech API
// This endpoint is kept for potential future server-side transcription needs
// router.post("/transcribe", async (req, res) => {
//   // Server-side transcription can be implemented here if needed
// });

// Convert text to speech using ElevenLabs
router.post("/speak", async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const audioBuffer = await textToSpeech(text, voiceId);
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (error) {
    console.error("Text-to-speech error:", error);
    res.status(500).json({ error: "Failed to convert text to speech" });
  }
});

export default router;
