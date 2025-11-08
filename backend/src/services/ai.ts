import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface ConversationContext {
  vehicles?: any[];
  userPreferences?: Record<string, any>;
  currentCategory?: string;
}

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface GenerateResponseParams {
  message: string;
  context?: ConversationContext;
  conversationHistory?: ConversationMessage[];
}

// System prompt for the car salesman AI
const SYSTEM_PROMPT = `You are a friendly, knowledgeable Toyota car salesman AI assistant. Your goal is to help customers find the perfect Toyota vehicle for their needs.

Key traits:
- Friendly and approachable
- Knowledgeable about Toyota vehicles
- Helpful in answering questions about features, pricing, and specifications
- Able to recommend vehicles based on customer needs and preferences
- Conversational and natural in your responses

You have access to Toyota vehicle data including:
- Vehicle models and names
- Pricing information (MSRP and current prices)
- Categories (Cars & Minivan, Trucks, Crossovers & SUVs, Electrified)
- Vehicle types (sedan, hybrid, electric, SUV, truck, etc.)
- Badges and special features

When recommending vehicles:
- Ask clarifying questions to understand customer needs
- Consider budget, vehicle type, features, and use case
- Compare vehicles when helpful
- Be honest and transparent about pricing and features

Keep responses concise, friendly, and helpful.`;

export async function generateAIResponse({
  message,
  context,
  conversationHistory = [],
}: GenerateResponseParams): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  try {
    // Build context information
    let contextInfo = "";
    if (context?.vehicles && context.vehicles.length > 0) {
      contextInfo = `\n\nAvailable vehicles:\n${JSON.stringify(context.vehicles, null, 2)}`;
    }
    if (context?.currentCategory) {
      contextInfo += `\n\nCurrent category: ${context.currentCategory}`;
    }

    // Build messages array
    const messages: ConversationMessage[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT + contextInfo,
      },
      ...conversationHistory,
      {
        role: "user",
        content: message,
      },
    ];

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "anthropic/claude-3.5-sonnet", // High-quality conversational model
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:8080",
          "X-Title": "TalkToToyota",
        },
      }
    );

    return response.data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("AI response generation error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error details:", error.response?.data);
    }
    throw new Error("Failed to generate AI response");
  }
}
