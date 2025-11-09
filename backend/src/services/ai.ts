import axios from "axios";
import { calculateFinancing } from "./finance.js";
import { config } from "../config/env.js";

const OPENROUTER_API_KEY = config.openrouterApiKey;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface ConversationContext {
  vehicles?: any[];
  userPreferences?: Record<string, any>;
  currentCategory?: string;
  selectedVehicle?: any;
  financingState?: FinancingState;
}

interface FinancingState {
  creditScore?: number;
  downPayment?: number;
  loanTermMonths?: number;
  tradeInValue?: number;
  salesTaxRate?: number;
  isComplete?: boolean;
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

interface AIResponse {
  response: string;
  financingState?: FinancingState;
  financingResults?: any;
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
function createSalesPrompt(vehicle: any, financingState?: FinancingState): string {
  const specs = vehicle.specifications || {};
  const pros = vehicle.pros || [];
  const features = vehicle.features || [];
  const bestFor = vehicle.bestFor || [];
  
  const basePrompt = `You are an enthusiastic, persuasive Toyota car salesman AI. Your PRIMARY GOAL is to help the customer with the ${vehicle.name} and guide them through financing options.

CURRENT VEHICLE: ${vehicle.name}
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
${vehicle.warranty ? `- Warranty: ${vehicle.warranty}` : ''}`;

  // Add financing collection instructions
  const financingPrompt = `

---FINANCING COLLECTION MODE---

You need to collect the following information from the customer to calculate their financing options:

REQUIRED FIELDS:
1. Credit Score (300-850)
2. Down Payment (dollar amount, can be $0)
3. Loan Term (36, 48, 60, or 72 months)

OPTIONAL FIELDS:
4. Trade-in Value (dollar amount, default to $0 if none)
5. Sales Tax Rate (percentage, default to 8% if unknown)

CURRENT FINANCING STATE:
${financingState?.creditScore ? `✓ Credit Score: ${financingState.creditScore}` : `✗ Credit Score: NOT COLLECTED`}
${financingState?.downPayment !== undefined ? `✓ Down Payment: $${financingState.downPayment.toLocaleString()}` : `✗ Down Payment: NOT COLLECTED`}
${financingState?.loanTermMonths ? `✓ Loan Term: ${financingState.loanTermMonths} months` : `✗ Loan Term: NOT COLLECTED`}
${financingState?.tradeInValue !== undefined ? `✓ Trade-in: $${financingState.tradeInValue.toLocaleString()}` : `○ Trade-in: Optional`}
${financingState?.salesTaxRate !== undefined ? `✓ Sales Tax: ${financingState.salesTaxRate}%` : `○ Sales Tax: Optional (default 8%)`}

INSTRUCTIONS FOR COLLECTING FINANCING INFO:

1. **Be conversational and natural** - Don't make it feel like a form
2. **Ask ONE question at a time** - Don't overwhelm the customer
3. **Explain WHY you need each piece of info** - Build trust
4. **Validate inputs** - If something seems off, politely confirm
5. **Offer examples/defaults** - Help customers who are unsure
6. **Extract data from natural language** - If they say "I have good credit around 720", extract 720

WHEN YOU COLLECT DATA:
- When the customer provides a credit score, down payment, or loan term, you MUST output it in this EXACT format at the END of your response:
  [FINANCING_DATA: {"creditScore": 720, "downPayment": 5000, "loanTermMonths": 60}]
- Only include the fields that were mentioned in this message
- This allows the system to track what's been collected

CONVERSATION FLOW:
${!financingState?.creditScore ? `
NEXT: Ask about credit score
Example: "To get you the best financing rates, I'll need to know your credit score. What's your current credit score? Most customers are in the 650-750 range."
` : !financingState?.downPayment && financingState.downPayment !== 0 ? `
NEXT: Ask about down payment
Example: "Great! With a ${financingState.creditScore} credit score, you'll get excellent rates. How much would you like to put down as a down payment? Many customers put down $3,000-$5,000, but you can put down any amount you're comfortable with, or even $0."
` : !financingState?.loanTermMonths ? `
NEXT: Ask about loan term
Example: "Perfect! Now, how many months would you like to finance for? Most customers choose:
- 36 months (pay off faster, higher monthly payment)
- 48 months (balanced option)
- 60 months (most popular, lower monthly payment)
- 72 months (lowest monthly payment)

Which term works best for your budget?"
` : !financingState?.tradeInValue && financingState.tradeInValue !== 0 ? `
NEXT: Ask about trade-in (optional)
Example: "Almost there! Do you have a vehicle to trade in? If so, what's its estimated value? If not, just say 'no trade-in' and we'll skip that."
` : !financingState?.salesTaxRate ? `
NEXT: Ask about sales tax (optional)
Example: "Last question - what's your local sales tax rate? If you're not sure, I can use the standard 8% rate."
` : `
ALL DATA COLLECTED! 
Say: "Perfect! I have all the information I need. Let me calculate your financing options..."
Then output: [CALCULATE_FINANCING]
The system will automatically calculate and show the results.
`}

EXAMPLES OF EXTRACTING DATA:

User: "My credit score is 720"
Your response: "Excellent credit! That qualifies you for great rates around 5-6% APR. [FINANCING_DATA: {"creditScore": 720}]"

User: "I can put down $5,000"
Your response: "Perfect! A $5,000 down payment will really help lower your monthly payments. [FINANCING_DATA: {"downPayment": 5000}]"

User: "I want a 5 year loan"
Your response: "Great choice! A 60-month term is our most popular option. [FINANCING_DATA: {"loanTermMonths": 60}]"

User: "I don't have a trade-in"
Your response: "No problem! We can work without a trade-in. [FINANCING_DATA: {"tradeInValue": 0}]"

User: "My credit score is around 680, I have $3000 for down payment, and I want the 60 month option"
Your response: "Fantastic! Let me get that calculated for you. Good credit at 680 will get you competitive rates, and that $3,000 down payment is great. [FINANCING_DATA: {"creditScore": 680, "downPayment": 3000, "loanTermMonths": 60}]"

REMEMBER:
- Be friendly and enthusiastic
- Explain the benefits of their choices
- Make them feel confident about the ${vehicle.name}
- Guide them naturally through the process
- ALWAYS output [FINANCING_DATA: {...}] when you extract any financial information
- ALWAYS output [CALCULATE_FINANCING] when all required fields are collected
`;

  return basePrompt + financingPrompt;
}

// Extract financing data from AI response
function extractFinancingData(aiResponse: string): Partial<FinancingState> | null {
  const match = aiResponse.match(/\[FINANCING_DATA:\s*({[^}]+})\]/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse financing data:", e);
      return null;
    }
  }
  return null;
}

// Check if AI wants to calculate financing
function shouldCalculateFinancing(aiResponse: string): boolean {
  return aiResponse.includes("[CALCULATE_FINANCING]");
}

// Clean AI response by removing special markers
function cleanAIResponse(response: string): string {
  return response
    .replace(/\[FINANCING_DATA:\s*{[^}]+}\]/g, "")
    .replace(/\[CALCULATE_FINANCING\]/g, "")
    .trim();
}

// Check if financing state is complete
function isFinancingComplete(state: FinancingState): boolean {
  return !!(
    state.creditScore &&
    state.downPayment !== undefined &&
    state.loanTermMonths
  );
}

export async function generateAIResponse({
  message,
  context,
  conversationHistory = [],
}: GenerateResponseParams): Promise<AIResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  try {
    // Initialize or get existing financing state
    const financingState: FinancingState = context?.financingState || {};

    // Determine which system prompt to use
    let systemPrompt: string;
    let contextInfo = "";

    // If a specific vehicle is selected, use sales-focused prompt with financing
    if (context?.selectedVehicle) {
      systemPrompt = createSalesPrompt(context.selectedVehicle, financingState);
    } else {
      // Otherwise use general prompt
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

    // Add debugging
    console.log("🤖 Sending to AI with", messages.length, "total messages");
    console.log("📋 Conversation history entries:", conversationHistory.length);
    console.log("💳 Financing state before AI:", JSON.stringify(financingState, null, 2));

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "anthropic/claude-3.5-sonnet",
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
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

    const aiResponse = response.data.choices[0]?.message?.content || 
                      "I'm sorry, I couldn't generate a response.";

    // Extract any financing data from the response
    const extractedData = extractFinancingData(aiResponse);
    
    if (extractedData) {
      console.log("✅ Extracted financing data:", JSON.stringify(extractedData, null, 2));
    }
    
    // Merge extracted data with existing state
    const updatedFinancingState: FinancingState = {
      ...financingState,
      ...extractedData,
    };
    
    console.log("💳 Updated financing state:", JSON.stringify(updatedFinancingState, null, 2));

    // Set default values for optional fields if not provided
    if (updatedFinancingState.tradeInValue === undefined && 
        isFinancingComplete(updatedFinancingState)) {
      updatedFinancingState.tradeInValue = 0;
    }
    if (updatedFinancingState.salesTaxRate === undefined && 
        isFinancingComplete(updatedFinancingState)) {
      updatedFinancingState.salesTaxRate = 8;
    }

    // Clean the response
    const cleanedResponse = cleanAIResponse(aiResponse);

    // Check if we should calculate financing
    let financingResults = null;
    if (shouldCalculateFinancing(aiResponse) && 
        isFinancingComplete(updatedFinancingState) &&
        context?.selectedVehicle) {
      
      try {
        financingResults = calculateFinancing({
          vehiclePrice: context.selectedVehicle.price,
          creditScore: updatedFinancingState.creditScore!,
          downPayment: updatedFinancingState.downPayment!,
          loanTermMonths: updatedFinancingState.loanTermMonths!,
          tradeInValue: updatedFinancingState.tradeInValue || 0,
          salesTaxRate: (updatedFinancingState.salesTaxRate || 8) / 100, // Convert to decimal
        });

        updatedFinancingState.isComplete = true;
      } catch (error) {
        console.error("Error calculating financing:", error);
      }
    }

    return {
      response: cleanedResponse,
      financingState: updatedFinancingState,
      financingResults,
    };

  } catch (error) {
    console.error("AI response generation error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Error details:", error.response?.data);
    }
    throw new Error("Failed to generate AI response");
  }
}