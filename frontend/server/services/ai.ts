import axios from "axios";
import type { Vehicle } from "../src/types/vehicle.js";
import { calculateFinancing } from "./finance.js";
import type { FinanceCalculationResult } from "./finance.js";
import { config } from "../config/env.js";

const OPENROUTER_API_KEY = config.openrouterApiKey;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface ConversationContext {
  vehicles?: Vehicle[];
  userPreferences?: Record<string, unknown>;
  currentCategory?: string;
  selectedVehicle?: Vehicle;
  compareVehicles?: Vehicle[];
  financingState?: FinancingState;
}

export interface FinancingState {
  creditScore?: number;
  downPayment?: number;
  loanTermMonths?: number;
  tradeInValue?: number;
  salesTaxRate?: number;
  isComplete?: boolean;
}

export interface ConversationMessage {
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
  financingResults?: FinanceCalculationResult | null;
}

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

function formatVehicleSnapshot(vehicle: Vehicle): string {
  const specs = vehicle.specifications || {};
  const pros = vehicle.pros || [];
  const features = vehicle.features || [];
  const bestFor = vehicle.bestFor || [];

  return `
NAME: ${vehicle.name}
PRICE: $${vehicle.price.toLocaleString()} (MSRP: $${vehicle.msrp.toLocaleString()}${vehicle.priceRange ? `, Range: ${vehicle.priceRange}` : ""})
${vehicle.year ? `YEAR: ${vehicle.year}` : ""}
${pros.length ? `TOP HIGHLIGHTS:\n${pros.map((p: string) => `- ${p}`).join("\n")}` : ""}
${features.length ? `KEY FEATURES:\n${features.map((f: string) => `- ${f}`).join("\n")}` : ""}
${bestFor.length ? `IDEAL FOR:\n${bestFor.map((b: string) => `- ${b}`).join("\n")}` : ""}
${specs.horsepower ? `HORSEPOWER: ${specs.horsepower} hp` : ""}
${specs.mpg?.combined ? `COMBINED MPG: ${specs.mpg.combined}` : ""}
${specs.seating ? `SEATING: ${specs.seating}` : ""}
${specs.fuelType ? `FUEL TYPE: ${specs.fuelType}` : ""}
${specs.engine ? `ENGINE: ${specs.engine}` : ""}
${specs.electricRange ? `ELECTRIC RANGE: ${specs.electricRange}` : ""}
${vehicle.warranty ? `WARRANTY: ${vehicle.warranty}` : ""}`.trim();
}

function financingChecklistInstructions(financingState?: FinancingState): string {
  return `

---FINANCING CHECKLIST MODE---

You must gather these details conversationally:
1. Credit Score (300-850)
2. Down Payment amount (can be $0)
3. Preferred Loan Term in months (36, 48, 60, 72)

Optional, ask when the moment feels natural:
4. Trade-in value (defaults to $0 if none)
5. Local sales tax rate (defaults to 8% if unsure)

CURRENT CHECKLIST STATUS:
${financingState?.creditScore ? `✓ Credit Score: ${financingState.creditScore}` : `✗ Credit Score: not collected`}
${financingState?.downPayment !== undefined ? `✓ Down Payment: $${financingState.downPayment.toLocaleString()}` : `✗ Down Payment: not collected`}
${financingState?.loanTermMonths ? `✓ Loan Term: ${financingState.loanTermMonths} months` : `✗ Loan Term: not collected`}
${financingState?.tradeInValue !== undefined ? `○ Trade-in: $${financingState.tradeInValue.toLocaleString()}` : `○ Trade-in: optional`}
${financingState?.salesTaxRate !== undefined ? `○ Sales Tax: ${financingState.salesTaxRate}%` : `○ Sales Tax: optional (use 8% if unknown)`}

GUIDANCE:
- Stay warm, curious, and helpful—make it feel like a one-on-one consultation.
- Ask ONE checklist item at a time.
- Explain why each item helps the shopper compare realistic monthly payments.
- Extract numbers when the customer mentions them naturally.
- Whenever the customer gives you checklist data, append it exactly like this at the END of your reply:
  [FINANCING_DATA: {"creditScore": 720, "downPayment": 5000}]
- Only include fields the customer mentioned in that turn.
- When all required fields are complete, append [CALCULATE_FINANCING] to trigger the quote.
${!financingState?.creditScore ? `
NEXT ITEM: Credit score (e.g. "To line up the best rates, where does your credit score fall? Most shoppers are between 650-750.")`
: !financingState?.downPayment && financingState.downPayment !== 0 ? `
NEXT ITEM: Down payment (e.g. "Great! How much are you thinking of putting down? Even $0 is okay—many buyers set aside $3K-$5K.")`
: !financingState?.loanTermMonths ? `
NEXT ITEM: Loan term (e.g. "Got it. Do you prefer 36, 48, 60, or 72 months? Longer terms drop the monthly amount.")`
: !financingState?.tradeInValue && financingState.tradeInValue !== 0 ? `
OPTIONAL: Trade-in (e.g. "Do you have a car you might trade in? If so, roughly what's it worth?")`
: !financingState?.salesTaxRate ? `
OPTIONAL: Sales tax (e.g. "What’s your local sales tax rate? If you’re unsure we’ll use 8%.")`
: `
ALL REQUIRED ITEMS COMPLETE — let them know you’ll calculate the numbers, then add [CALCULATE_FINANCING].`}
  `.trim();
}

function createSalesPrompt(vehicle: Vehicle, financingState?: FinancingState): string {
  const basePrompt = `You are an enthusiastic, persuasive Toyota car salesman AI. Your PRIMARY GOAL is to help the customer with the ${vehicle.name} and guide them through financing options.

CURRENT VEHICLE: ${vehicle.name}
PRICE: $${vehicle.price.toLocaleString()} (Starting MSRP: $${vehicle.msrp.toLocaleString()})
${vehicle.priceRange ? `PRICE RANGE: ${vehicle.priceRange}` : ""}
${vehicle.year ? `YEAR: ${vehicle.year}` : ""}

VEHICLE HIGHLIGHTS & SELLING POINTS:
${(vehicle.pros || []).length > 0 ? `PROS:\n${(vehicle.pros || []).map((p: string) => `- ${p}`).join("\n")}` : ""}

${(vehicle.features || []).length > 0 ? `KEY FEATURES:\n${(vehicle.features || []).map((f: string) => `- ${f}`).join("\n")}` : ""}

${(vehicle.bestFor || []).length > 0 ? `PERFECT FOR:\n${(vehicle.bestFor || []).map((b: string) => `- ${b}`).join(", ")}` : ""}

SPECIFICATIONS:
${vehicle.specifications?.horsepower ? `- Horsepower: ${vehicle.specifications.horsepower} hp` : ""}
${vehicle.specifications?.mpg?.combined ? `- MPG (Combined): ${vehicle.specifications.mpg.combined}` : ""}
${vehicle.specifications?.seating ? `- Seating: ${vehicle.specifications.seating} passengers` : ""}
${vehicle.specifications?.fuelType ? `- Fuel Type: ${vehicle.specifications.fuelType}` : ""}
${vehicle.specifications?.engine ? `- Engine: ${vehicle.specifications.engine}` : ""}
${vehicle.specifications?.cargoSpace ? `- Cargo Space: ${vehicle.specifications.cargoSpace}` : ""}
${vehicle.specifications?.electricRange ? `- Electric Range: ${vehicle.specifications.electricRange}` : ""}
${vehicle.warranty ? `- Warranty: ${vehicle.warranty}` : ""}`;

  return basePrompt + financingChecklistInstructions(financingState);
}

function createComparePrompt(vehicles: Vehicle[], financingState?: FinancingState): string {
  const [primary, secondary] = vehicles;

  const header = `You are an insightful Toyota product specialist helping a shopper compare two vehicles side-by-side. Stay personable, celebrate the strengths of each vehicle, and guide them toward a confident choice.`;

  const comparisonOverview = `
VEHICLE A SNAPSHOT:
${formatVehicleSnapshot(primary)}

---

VEHICLE B SNAPSHOT:
${formatVehicleSnapshot(secondary)}

---

COMPARISON TIPS:
- Call out where each vehicle shines (performance, efficiency, tech, cargo, etc.).
- Help the shopper weigh trade-offs based on their lifestyle comments.
- Offer friendly suggestions like "If you love X, the ${primary.name} really delivers, while the ${secondary.name} gives you Y."`;

  const financingInstructions = `
FINANCING FOCUS:
- Let them know you can surface monthly payment estimates for BOTH vehicles once you gather the checklist info.
- Reinforce that sharing credit score, down payment, and term lets you compare affordability apples-to-apples.
${financingChecklistInstructions(financingState)}
`;

  return [header, comparisonOverview, financingInstructions].join("\n\n");
}

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

function shouldCalculateFinancing(aiResponse: string): boolean {
  return aiResponse.includes("[CALCULATE_FINANCING]");
}

function cleanAIResponse(response: string): string {
  return response
    .replace(/\[FINANCING_DATA:\s*{[^}]+}\]/g, "")
    .replace(/\[CALCULATE_FINANCING\]/g, "")
    .trim();
}

function isFinancingComplete(state: FinancingState): boolean {
  return !!(state.creditScore && state.downPayment !== undefined && state.loanTermMonths);
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
    const financingState: FinancingState = context?.financingState || {};

    let systemPrompt: string;
    let contextInfo = "";

    if (context?.compareVehicles && context.compareVehicles.length >= 2) {
      systemPrompt = createComparePrompt(context.compareVehicles.slice(0, 2), financingState);
    } else if (context?.selectedVehicle) {
      systemPrompt = createSalesPrompt(context.selectedVehicle, financingState);
    } else {
      systemPrompt = GENERAL_SYSTEM_PROMPT;
      if (context?.vehicles && context.vehicles.length > 0) {
        contextInfo = `\n\nAvailable vehicles:\n${JSON.stringify(context.vehicles.slice(0, 20), null, 2)}`;
      }
      if (context?.currentCategory) {
        contextInfo += `\n\nCurrent category: ${context.currentCategory}`;
      }
    }

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

    console.log("🤖 Sending to AI with", messages.length, "total messages");
    console.log("📋 Conversation history entries:", conversationHistory.length);
    console.log("💳 Financing state before AI:", JSON.stringify(financingState, null, 2));

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "anthropic/claude-3.5-sonnet",
        messages,
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": config.appUrl,
          "X-Title": "TalkToToyota",
        },
      }
    );

    const aiResponse =
      response.data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    const extractedData = extractFinancingData(aiResponse);

    if (extractedData) {
      console.log("✅ Extracted financing data:", JSON.stringify(extractedData, null, 2));
    }

    const updatedFinancingState: FinancingState = {
      ...financingState,
      ...extractedData,
    };

    console.log("💳 Updated financing state:", JSON.stringify(updatedFinancingState, null, 2));

    if (
      updatedFinancingState.tradeInValue === undefined &&
      isFinancingComplete(updatedFinancingState)
    ) {
      updatedFinancingState.tradeInValue = 0;
    }
    if (
      updatedFinancingState.salesTaxRate === undefined &&
      isFinancingComplete(updatedFinancingState)
    ) {
      updatedFinancingState.salesTaxRate = 8;
    }

    const cleanedResponse = cleanAIResponse(aiResponse);

    let financingResults = null;
    if (
      shouldCalculateFinancing(aiResponse) &&
      isFinancingComplete(updatedFinancingState) &&
      context?.selectedVehicle
    ) {
      try {
        financingResults = calculateFinancing({
          vehiclePrice: context.selectedVehicle.price,
          creditScore: updatedFinancingState.creditScore!,
          downPayment: updatedFinancingState.downPayment!,
          loanTermMonths: updatedFinancingState.loanTermMonths!,
          tradeInValue: updatedFinancingState.tradeInValue || 0,
          salesTaxRate: (updatedFinancingState.salesTaxRate || 8) / 100,
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

