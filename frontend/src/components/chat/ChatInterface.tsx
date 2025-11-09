import { useState } from "react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { getAIResponse, type FinancingState } from "@/services/api";
import { Vehicle } from "@/types/vehicle";
import MessageBubble from "./MessageBubble";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  vehicles: Vehicle[];
  currentCategory?: string;
  selectedVehicle?: Vehicle | null;
  className?: string;
}

export default function ChatInterface({
  vehicles,
  currentCategory,
  selectedVehicle,
  className,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant" | "system"; content: string }>
  >([]);
  const [financingState, setFinancingState] = useState<FinancingState>({});

  const [hasWelcomed, setHasWelcomed] = React.useState(false);

  // Reset conversation when vehicle changes
  React.useEffect(() => {
    if (selectedVehicle) {
      setMessages([]);
      setConversationHistory([]);
      setHasWelcomed(false);
      setFinancingState({});
    } else {
      // Clear messages when no vehicle is selected
      setMessages([]);
      setConversationHistory([]);
      setHasWelcomed(false);
      setFinancingState({});
    }
  }, [selectedVehicle?.id]);

  // Send welcome message once when vehicle is selected
  React.useEffect(() => {
    if (selectedVehicle && !hasWelcomed && messages.length === 0) {
      const welcomeMessage: Message = {
        role: "assistant",
        content: `Hi! I'm excited to tell you about the ${selectedVehicle.name}! This is an excellent choice. What would you like to know about this vehicle? I can tell you about its features, specifications, pricing, and help you decide if it's the perfect fit for you.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setConversationHistory([
        { role: "assistant", content: welcomeMessage.content }
      ]);
      setHasWelcomed(true);
    }
  }, [selectedVehicle, hasWelcomed, messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const newHistory = [
      ...conversationHistory,
      { role: "user" as const, content: input },
    ];
    // Keep only the last 10 messages to reduce token usage
    const limitedHistory = newHistory.slice(-10);
    setConversationHistory(newHistory);

    try {
      const aiResponse = await getAIResponse({
        message: input,
        context: {
          vehicles,
          currentCategory,
          selectedVehicle,
          financingState,
        },
        conversationHistory: limitedHistory,
      });

      const updatedFinancingState = aiResponse.financingState ?? financingState;
      setFinancingState(updatedFinancingState);

      let assistantContent = aiResponse.response;

      if (aiResponse.financingResults) {
        const result = aiResponse.financingResults;
        const formatter = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });

        const [baseAlt, ...otherAlternatives] = result.alternatives || [];

        const baseAltText = baseAlt
          ? `• ${baseAlt.description}: $${formatter.format(baseAlt.monthlyPayment)}/mo`
          : null;

        const altText = otherAlternatives
          .map((alt, idx) => {
            const payment = formatter.format(alt.monthlyPayment);
            const monthlyChange =
              alt.savings !== undefined && alt.savings !== null && alt.savings !== 0
                ? `${alt.savings > 0 ? "saves" : "adds"} $${formatter.format(Math.abs(alt.savings))}/mo`
                : null;
            const totalChange =
              alt.totalCostChange !== undefined &&
              alt.totalCostChange !== null &&
              alt.totalCostChange !== 0
                ? `${alt.totalCostChange < 0 ? "saves" : "adds"} $${formatter.format(Math.abs(alt.totalCostChange))}/total`
                : null;

            const changes = [monthlyChange, totalChange].filter(Boolean).join(", ");
            const changeText = changes ? ` (${changes})` : "";
            return `${idx + 1}. ${alt.description}: $${payment}/mo${changeText}`;
          })
          .join("\n");

        assistantContent +=
          `\n\nFinancing Summary:\n` +
          `- Monthly Payment: $${formatter.format(result.monthlyPayment)}\n` +
          `- APR: ${result.apr}%\n` +
          `- Total Cost: $${formatter.format(result.totalCost)}\n` +
          `- Amount Financed: $${formatter.format(result.amountFinanced)}\n` +
          (result.recommendation ? `\n${result.recommendation}\n` : "") +
          (baseAltText ? `\nAlternative Options:\n${baseAltText}` : "") +
          (altText ? `\nSuggested Adjustments:\n${altText}` : "");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory([
        ...newHistory,
        { role: "assistant" as const, content: assistantContent },
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const errorMessage: Message = {
        role: "assistant",
        content: errorMsg.includes("Backend server is not running") 
          ? "⚠️ Backend server is not running. Please start the backend server (npm run dev:backend) to use AI features."
          : `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className={`${className} h-full flex flex-col`}>
      <CardHeader>
        <CardTitle>
          {selectedVehicle 
            ? `Chat about ${selectedVehicle.name}` 
            : "Chat with AI Salesman"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && !selectedVehicle && (
            <div className="text-center text-muted-foreground py-8">
              <p>Start a conversation with our AI car salesman!</p>
              <p className="text-sm mt-2">Ask about vehicles, get recommendations, or compare models.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
        </div>
        <div className="border rounded-lg p-3 mb-4 bg-muted/40">
          <p className="text-sm font-semibold mb-2">Financing Checklist</p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>
              {financingState.creditScore !== undefined ? "✅" : "⬜"} Credit Score{" "}
              {financingState.creditScore !== undefined && `( ${financingState.creditScore} )`}
            </li>
            <li>
              {financingState.downPayment !== undefined ? "✅" : "⬜"} Down Payment{" "}
              {financingState.downPayment !== undefined &&
                `( $${new Intl.NumberFormat("en-US").format(financingState.downPayment)} )`}
            </li>
            <li>
              {financingState.loanTermMonths !== undefined ? "✅" : "⬜"} Loan Term{" "}
              {financingState.loanTermMonths !== undefined && `( ${financingState.loanTermMonths} months )`}
            </li>
            <li>
              {financingState.tradeInValue !== undefined ? "✅" : "⬜"} Trade-In Value{" "}
              {financingState.tradeInValue !== undefined &&
                `( $${new Intl.NumberFormat("en-US").format(financingState.tradeInValue)} )`}
            </li>
            <li>
              {financingState.salesTaxRate !== undefined ? "✅" : "⬜"} Sales Tax Rate{" "}
              {financingState.salesTaxRate !== undefined && `( ${financingState.salesTaxRate}% )`}
            </li>
          </ul>
        </div>
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about vehicles..."
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
