import { ElevenLabsClient } from "elevenlabs";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

if (!ELEVENLABS_API_KEY) {
  console.warn("ELEVENLABS_API_KEY is not set");
}

const client = ELEVENLABS_API_KEY ? new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY }) : null;

export async function textToSpeech(text: string, voiceId?: string): Promise<Buffer> {
  if (!client) {
    throw new Error("ElevenLabs client is not configured");
  }

  try {
    const audio = await client.textToSpeech.convert(voiceId || DEFAULT_VOICE_ID, {
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true,
      },
    });

    const chunks: Uint8Array[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    throw new Error("Failed to convert text to speech");
  }
}

export async function getVoices() {
  if (!client) {
    throw new Error("ElevenLabs client is not configured");
  }

  try {
    const voices = await client.voices.getAll();
    return voices;
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw new Error("Failed to fetch voices");
  }
}

