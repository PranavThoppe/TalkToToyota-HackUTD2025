import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "./_lib/cors";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  res.status(200).json({
    message: "TalkToToyota Backend API",
    status: "running",
    endpoints: {
      health: "/api/health",
      voice: {
        speak: "POST /api/voice/speak",
      },
      ai: {
        conversation: "POST /api/ai/conversation",
        checkout: "POST /api/ai/checkout",
      },
      finance: {
        calculate: "POST /api/finance/calculate",
        aprEstimate: "GET /api/finance/apr-estimate/:creditScore",
      },
    },
    note: "This API runs inside the Vercel deployment alongside the frontend.",
  });
}

