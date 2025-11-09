import { Router } from "express";
import { generateAIResponse } from "../services/ai.js";

const router = Router();

// Generate AI conversation response with financing support
router.post("/conversation", async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Validate context if provided
    if (context && typeof context !== 'object') {
      return res.status(400).json({ error: "Context must be an object" });
    }

    // Validate conversation history if provided
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return res.status(400).json({ error: "Conversation history must be an array" });
    }

    // Add debugging logs
    console.log("📨 Received message:", message);
    console.log("💬 Conversation history length:", conversationHistory?.length || 0);
    if (conversationHistory && conversationHistory.length > 0) {
      console.log("📜 Last 2 messages in history:", 
        conversationHistory.slice(-2).map((m: any) => `${m.role}: ${m.content.substring(0, 50)}...`));
    }
    console.log("💰 Current financing state:", context?.financingState || "none");

    const result = await generateAIResponse({
      message,
      context,
      conversationHistory,
    });

    // Build updated conversation history to return
    const updatedHistory = [
      ...(conversationHistory || []),
      { role: "user" as const, content: message },
      { role: "assistant" as const, content: result.response },
    ];

    // Return the AI response along with updated financing state, results, and conversation history
    return res.json({
      response: result.response,
      financingState: result.financingState,
      financingResults: result.financingResults,
      conversationHistory: updatedHistory, // Return updated history
    });

  } catch (error) {
    console.error("AI conversation error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("OPENROUTER_API_KEY")) {
        return res.status(500).json({ 
          error: "OpenRouter API is not configured. Please set OPENROUTER_API_KEY in environment variables." 
        });
      }
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Failed to generate AI response" });
    }
  }
});

export default router;