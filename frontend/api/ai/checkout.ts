import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleCors } from "../_lib/cors.js";
import { readJsonBody } from "../_lib/request.js";
import { generateCheckoutAIResponse } from "../../server/services/checkout-ai.js";
import type {
  CheckoutConversationContext,
  ConversationMessage,
} from "../../server/services/checkout-ai.js";

type ConversationHistoryEntry = ConversationMessage;

interface CheckoutRequest {
  message?: string;
  context?: CheckoutConversationContext;
  conversationHistory?: ConversationHistoryEntry[];
}

const MAX_HISTORY = 12;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJsonBody<CheckoutRequest>(req);
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

    const limitedHistory = conversationHistory?.slice(-MAX_HISTORY);

    const result = await generateCheckoutAIResponse({
      message,
      context,
      conversationHistory: limitedHistory,
    });

    const updatedHistory: ConversationHistoryEntry[] = [
      ...(limitedHistory || []),
      { role: "user", content: message },
      { role: "assistant", content: result.response },
    ];

    res.status(200).json({
      response: result.response,
      conversationHistory: updatedHistory,
    });
  } catch (error) {
    console.error("Checkout AI conversation error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate checkout AI response",
    });
  }
}

