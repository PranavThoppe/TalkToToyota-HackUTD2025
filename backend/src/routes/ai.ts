import { Router } from "express";
import { generateAIResponse } from "../services/ai.js";

const router = Router();

// Generate AI conversation response
router.post("/conversation", async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await generateAIResponse({
      message,
      context,
      conversationHistory,
    });

    res.json({ response });
  } catch (error) {
    console.error("AI conversation error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

export default router;
