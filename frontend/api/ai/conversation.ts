import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors";
import { readJsonBody } from "../_lib/request";
import { generateAIResponse } from "../../server/services/ai";
import type {
  ConversationContext,
  ConversationMessage,
} from "../../server/services/ai";

type ConversationHistoryEntry = ConversationMessage;

interface ConversationRequest {
  message?: string;
  context?: ConversationContext;
  conversationHistory?: ConversationHistoryEntry[];
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
    const body = await readJsonBody<ConversationRequest>(req);
    const { message, context, conversationHistory } = body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (context && typeof context !== "object") {
      res.status(400).json({ error: "Context must be an object" });
      return;
    }

    if (conversationHistory && !Array.isArray(conversationHistory)) {
      res.status(400).json({ error: "Conversation history must be an array" });
      return;
    }

    console.log("📨 Received message:", message);
    console.log("💬 Conversation history length:", conversationHistory?.length || 0);
    if (conversationHistory && conversationHistory.length > 0) {
      console.log(
        "📜 Last 2 messages in history:",
        conversationHistory
          .slice(-2)
          .map(m => `${m.role}: ${m.content.substring(0, 50)}...`)
      );
    }
    console.log("💰 Current financing state:", context?.financingState || "none");

    const result = await generateAIResponse({
      message,
      context,
      conversationHistory,
    });

    const updatedHistory: ConversationHistoryEntry[] = [
      ...(conversationHistory || []),
      { role: "user", content: message },
      { role: "assistant", content: result.response },
    ];

    res.status(200).json({
      response: result.response,
      financingState: result.financingState,
      financingResults: result.financingResults,
      conversationHistory: updatedHistory,
    });
  } catch (error) {
    console.error("AI conversation error:", error);
    if (error instanceof Error && error.message.includes("OPENROUTER_API_KEY")) {
      res.status(500).json({
        error: "OpenRouter API is not configured. Please set OPENROUTER_API_KEY in environment variables.",
      });
      return;
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate AI response",
    });
  }
}

