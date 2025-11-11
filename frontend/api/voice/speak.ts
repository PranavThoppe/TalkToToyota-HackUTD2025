import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { readJsonBody } from "../_lib/request";
import { textToSpeech } from "../../server/services/elevenlabs";

interface VoiceRequestBody {
  text?: string;
  voiceId?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJsonBody<VoiceRequestBody>(req);
    const { text, voiceId } = body;

    if (!text) {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const audioBuffer = await textToSpeech(text, voiceId);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length.toString());
    res.status(200).send(audioBuffer);
  } catch (error) {
    console.error("Text-to-speech error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to convert text to speech",
    });
  }
}

