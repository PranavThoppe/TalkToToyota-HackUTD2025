import axios from "axios";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface ConversationContext {
  vehicles?: any[];
  userPreferences?: Record<string, any>;
  currentCategory?: string;
  selectedVehicle?: any;
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

// System prompt for general car salesman AI
const GENERAL_SYSTEM_PROMPT = `You are a friendly, knowledgeable Toyota car salesman AI assistant. Your goal is to help customers find the perfect Toyota vehicle for their needs.

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

// System prompt for sales-focused AI when a specific vehicle is selected
function createSalesPrompt(vehicle: any): string {
  const specs = vehicle.specifications || {};
  const pros = vehicle.pros || [];
  const features = vehicle.features || [];
  const bestFor = vehicle.bestFor || [];
  
  return `You are an enthusiastic, persuasive Toyota car salesman AI. Your PRIMARY GOAL is to SELL the ${vehicle.name} to the customer and guide them to ADD IT TO CART and CHECKOUT.

CURRENT VEHICLE BEING SOLD: ${vehicle.name}
PRICE: $${vehicle.price.toLocaleString()} (Starting MSRP: $${vehicle.msrp.toLocaleString()})
${vehicle.priceRange ? `PRICE RANGE: ${vehicle.priceRange}` : ''}
${vehicle.year ? `YEAR: ${vehicle.year}` : ''}

VEHICLE HIGHLIGHTS & SELLING POINTS:
${pros.length > 0 ? `PROS:\n${pros.map((p: string) => `- ${p}`).join('\n')}` : ''}

${features.length > 0 ? `KEY FEATURES:\n${features.map((f: string) => `- ${f}`).join('\n')}` : ''}

${bestFor.length > 0 ? `PERFECT FOR:\n${bestFor.map((b: string) => `- ${b}`).join(', ')}` : ''}

SPECIFICATIONS:
${specs.horsepower ? `- Horsepower: ${specs.horsepower} hp` : ''}
${specs.mpg?.combined ? `- MPG (Combined): ${specs.mpg.combined}` : ''}
${specs.seating ? `- Seating: ${specs.seating} passengers` : ''}
${specs.fuelType ? `- Fuel Type: ${specs.fuelType}` : ''}
${specs.engine ? `- Engine: ${specs.engine}` : ''}
${specs.cargoSpace ? `- Cargo Space: ${specs.cargoSpace}` : ''}
${specs.electricRange ? `- Electric Range: ${specs.electricRange}` : ''}
${vehicle.warranty ? `- Warranty: ${vehicle.warranty}` : ''}

SALES STRATEGY:
1. Be ENTHUSIASTIC and POSITIVE about this vehicle - it's an excellent choice!
2. Highlight the PROS and KEY FEATURES that match customer needs
3. Address concerns by emphasizing benefits and value
4. Use the vehicle's SPECIFICATIONS to build confidence
5. Create URGENCY and EXCITEMENT about owning this vehicle
6. Always guide the conversation toward: "Ready to add this to your cart?" or "Shall we proceed to checkout?"
7. Be helpful and answer questions, but always steer back to why this vehicle is perfect for them
8. Use the "bestFor" categories to personalize your pitch

CONVERSATION STYLE:
- Friendly, enthusiastic, and confident
- Use phrases like "Great choice!", "You'll love...", "This vehicle is perfect for..."
- Emphasize value, quality, and Toyota's reputation
- Be conversational but sales-focused
- Ask closing questions: "Ready to make it yours?", "Shall we add it to your cart?"

REMEMBER: Your goal is to SELL this vehicle and get the customer to ADD TO CART and CHECKOUT. Be persuasive but not pushy. Build excitement and confidence in their choice.`;
}

export async function generateAIResponse({
  message,
  context,
  conversationHistory = [],
}: GenerateResponseParams): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  try {
    // Determine which system prompt to use
    let systemPrompt: string;
    let contextInfo = "";

    // If a specific vehicle is selected, use sales-focused prompt
    if (context?.selectedVehicle) {
      systemPrompt = createSalesPrompt(context.selectedVehicle);
    } else {
      // Otherwise use general prompt with vehicle list context
      systemPrompt = GENERAL_SYSTEM_PROMPT;
      if (context?.vehicles && context.vehicles.length > 0) {
        contextInfo = `\n\nAvailable vehicles:\n${JSON.stringify(context.vehicles.slice(0, 20), null, 2)}`;
      }
      if (context?.currentCategory) {
        contextInfo += `\n\nCurrent category: ${context.currentCategory}`;
      }
    }

    // Build messages array
    const messages: ConversationMessage[] = [
      {
        role: "system",
        content: systemPrompt + contextInfo,
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
