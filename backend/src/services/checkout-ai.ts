import axios from "axios";
import { config } from "../config/env.js";

const OPENROUTER_API_KEY = config.openrouterApiKey;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface CheckoutConversationContext {
  vehicle?: any;
  financingSummary?: {
    monthlyPayment?: number;
    apr?: number;
    totalCost?: number;
    amountFinanced?: number;
    recommendation?: string;
  };
  appliedOffer?: {
    title: string;
    description?: string;
    savingsAmount: number;
    deadlineHours: number;
  };
}

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface GenerateCheckoutParams {
  message: string;
  context?: CheckoutConversationContext;
  conversationHistory?: ConversationMessage[];
}

interface CheckoutAIResponse {
  response: string;
}

const INCENTIVE_PLAYBOOK = `
Incentive Playbook (use whichever is most persuasive based on the conversation):
- College Graduate Rebate: $750 for recent graduates who finalize during this event.
- Military Appreciation Bonus: $1,000 bonus cash for active duty, reservists, or veterans.
- Flash Sales Bonus: $500 when the customer completes checkout before the weekend.
- Trade-In Bonus: Up to $1,500 additional trade-in value if they bring their current vehicle this week.
- Toyota Loyalty Cash: $750 for current Toyota owners upgrading to a new model.
- Hybrid & EV Rebate: $1,000 rebate on select hybrid or electric models for eco-focused shoppers.
- Limited Stock Priority Offer: Priority delivery and promotional APR when inventory is running low.
- Partner Financing Special: 0% APR for 36 months on select trims through our finance partner.
- Refer-a-Friend Bonus: $250 service credit for the customer and their referral.
- ToyotaCare Plus Upgrade: Complimentary extra year of scheduled maintenance when they finalize this week.

Always tailor the incentive pitch to the customer's situation, reference urgency using the deadline window, and invite them to press "Complete Checkout" to secure it.`;

function buildCheckoutPrompt(context?: CheckoutConversationContext): string {
  const basePrompt = `You are a proactive Toyota checkout specialist. Your primary goal is to guide the customer to complete their vehicle purchase today.

Guidelines:
- Be concise (3-4 sentences) and action-oriented in every response.
- Reference the specific vehicle and financing plan when helpful.
- Assume financing is already approved; focus on confirming readiness, answering last-minute questions, and scheduling final logistics.
- Empathize with concerns but always steer the conversation toward completing checkout now.
- Offer clear next steps such as confirming contact details, selecting pickup or delivery, or clicking the "Complete Checkout" button.
- Celebrate momentum and reinforce limited-time offers or savings when relevant.
- If the customer is ready, congratulate them and instruct them to press the "Complete Checkout" button to finalize.
- Avoid collecting sensitive data (SSN, full address, payment card numbers). Keep interactions high-level but decisive.
`;

  if (!context) {
    return `${basePrompt}

${INCENTIVE_PLAYBOOK}`;
  }

  const vehicle = context.vehicle;
  const financing = context.financingSummary;
  const offer = context.appliedOffer;

  const vehicleDetails = vehicle
    ? `
Customer Vehicle:
- Model: ${vehicle.name || "Unknown"}
- Price: $${vehicle.price ? vehicle.price.toLocaleString() : "N/A"}
${vehicle.year ? `- Model Year: ${vehicle.year}` : ""}
${vehicle.badges ? `- Highlights: ${(vehicle.badges as string[]).join(", ")}` : ""}
`
    : "";

  const financingDetails = financing
    ? `
Financing Snapshot:
- Monthly Payment: ${financing.monthlyPayment ? `$${financing.monthlyPayment.toLocaleString()}` : "N/A"}
- APR: ${financing.apr !== undefined ? `${financing.apr}%` : "N/A"}
- Total Cost: ${financing.totalCost ? `$${financing.totalCost.toLocaleString()}` : "N/A"}
- Amount Financed: ${financing.amountFinanced ? `$${financing.amountFinanced.toLocaleString()}` : "N/A"}
${financing.recommendation ? `- Recommendation: ${financing.recommendation}` : ""}
`
    : "";

  const offerDetails = offer
    ? `
Active Incentive:
- ${offer.title} worth $${offer.savingsAmount.toLocaleString()}
- Must complete checkout within ${offer.deadlineHours} hours to keep this incentive.
${offer.description ? `- Details: ${offer.description}` : ""}
`
    : "";

  const closingGuidance = `
Conversation Objectives:
- Confirm the customer is ready to complete their purchase.
- Highlight any currently applied incentive or create urgency with time-bound savings.
- Offer to schedule pickup/delivery or connect them with a specialist if needed.
- Always end with a clear call-to-action toward completing checkout now.
`;

  return `${basePrompt}

${INCENTIVE_PLAYBOOK}` + vehicleDetails + financingDetails + offerDetails + closingGuidance;
}

export async function generateCheckoutAIResponse({
  message,
  context,
  conversationHistory = [],
}: GenerateCheckoutParams): Promise<CheckoutAIResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const systemPrompt = buildCheckoutPrompt(context);

  const messages: ConversationMessage[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...conversationHistory,
    {
      role: "user",
      content: message,
    },
  ];

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "anthropic/claude-3.5-sonnet",
        messages,
        temperature: 0.6,
        max_tokens: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "http://localhost:8080",
          "X-Title": "TalkToToyota Checkout",
        },
      }
    );

    const aiResponse =
      response.data.choices?.[0]?.message?.content?.trim() ||
      "I'm here to help finalize your Toyota purchase whenever you're ready.";

    return { response: aiResponse };
  } catch (error) {
    console.error("Checkout AI response error:", error);
    if (axios.isAxiosError(error)) {
      console.error("Checkout AI error details:", error.response?.data);
    }
    throw new Error("Failed to connect to the checkout assistant");
  }
}

