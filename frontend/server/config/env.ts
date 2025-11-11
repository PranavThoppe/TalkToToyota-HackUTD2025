import dotenv from "dotenv";

// Load environment variables from .env files during local development.
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

function resolveAppUrl(): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:5173";
}

export const config = {
  port: process.env.PORT || 3001,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
  appUrl: resolveAppUrl(),
  nodeEnv: process.env.NODE_ENV || "development",
};

if (!config.openrouterApiKey) {
  console.warn("⚠️  OPENROUTER_API_KEY is not set");
}

if (!config.elevenlabsApiKey) {
  console.warn("⚠️  ELEVENLABS_API_KEY is not set");
}

