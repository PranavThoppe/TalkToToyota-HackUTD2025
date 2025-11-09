// backend/src/index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import voiceRoutes from "./routes/voice.js";
import aiRoutes from "./routes/ai.js";
import financeRoutes from "./routes/finance.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (_req, res) => {
  res.json({ 
    message: "TalkToToyota Backend API",
    status: "running",
    endpoints: {
      health: "/health",
      voice: {
        speak: "POST /api/voice/speak"
      },
      ai: {
        conversation: "POST /api/ai/conversation",
        checkout: "POST /api/ai/checkout"
      },
      finance: {
        calculate: "POST /api/finance/calculate",
        aprEstimate: "GET /api/finance/apr-estimate/:creditScore"
      }
    },
    note: "This is the backend API. The frontend runs on http://localhost:8080"
  });
});

// Routes
app.use("/api/voice", voiceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/finance", financeRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "TalkToToyota Backend API" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});