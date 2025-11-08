import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
  appUrl: process.env.APP_URL || "http://localhost:8080",
  nodeEnv: process.env.NODE_ENV || "development",
};

// Validate required environment variables
if (!config.openrouterApiKey) {
  console.warn("⚠️  OPENROUTER_API_KEY is not set");
}

if (!config.elevenlabsApiKey) {
  console.warn("⚠️  ELEVENLABS_API_KEY is not set");
}
