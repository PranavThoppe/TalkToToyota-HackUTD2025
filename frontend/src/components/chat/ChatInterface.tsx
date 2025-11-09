import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { getAIResponse, type FinancingState, type FinancingResults } from "@/services/api";
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
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant" | "system"; content: string }>
  >([]);
  const [financingState, setFinancingState] = useState<FinancingState>({});
  const [financingResults, setFinancingResults] = useState<FinancingResults | null>(null);

  const [hasWelcomed, setHasWelcomed] = React.useState(false);

  // Reset conversation when vehicle changes
  React.useEffect(() => {
    if (selectedVehicle) {
      setMessages([]);
      setConversationHistory([]);
      setHasWelcomed(false);
      setFinancingState({});
      setFinancingResults(null);
    } else {
      // Clear messages when no vehicle is selected
      setMessages([]);
      setConversationHistory([]);
      setHasWelcomed(false);
      setFinancingState({});
      setFinancingResults(null);
    }
  }, [selectedVehicle?.id]);

  // Send welcome message once when vehicle is selected
  React.useEffect(() => {
    if (selectedVehicle && !hasWelcomed && messages.length === 0) {
      const welcomeMessage: Message = {
        role: "assistant",
        content: `Hi! I see you're interested in the ${selectedVehicle.name}! To help you with financing options, I'll need to gather some information. First, could you please tell me your credit score? This will help me find the best rates available for you. You can enter a number between 300-850, or if you're not sure, I can explain how to check it.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setConversationHistory([
        { role: "assistant", content: welcomeMessage.content }
      ]);
      setHasWelcomed(true);
    }
  }, [selectedVehicle, hasWelcomed, messages.length]);

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );

  const aprFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    []
  );

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
      setFinancingResults(aiResponse.financingResults ?? null);

      let assistantContent = aiResponse.response;

      if (aiResponse.financingResults) {
        const result = aiResponse.financingResults;
        const [baseAlt, ...otherAlternatives] = result.alternatives || [];

        const baseAltText = baseAlt
          ? `• ${baseAlt.description}: $${currencyFormatter.format(baseAlt.monthlyPayment)}/mo`
          : null;

        const altText = otherAlternatives
          .map((alt, idx) => {
            const payment = currencyFormatter.format(alt.monthlyPayment);
            const monthlyChange =
              alt.savings !== undefined && alt.savings !== null && alt.savings !== 0
                ? `${alt.savings > 0 ? "saves" : "adds"} $${currencyFormatter.format(Math.abs(alt.savings))}/mo`
                : null;
            const totalChange =
              alt.totalCostChange !== undefined &&
              alt.totalCostChange !== null &&
              alt.totalCostChange !== 0
                ? `${alt.totalCostChange < 0 ? "saves" : "adds"} $${currencyFormatter.format(Math.abs(alt.totalCostChange))}/total`
                : null;

            const changes = [monthlyChange, totalChange].filter(Boolean).join(", ");
            const changeText = changes ? ` (${changes})` : "";
            return `${idx + 1}. ${alt.description}: $${payment}/mo${changeText}`;
          })
          .join("\n");

        assistantContent +=
          `\n\nFinancing Summary:\n` +
          `- Monthly Payment: ${currencyFormatter.format(result.monthlyPayment)}\n` +
          `- APR: ${result.apr}%\n` +
          `- Total Cost: ${currencyFormatter.format(result.totalCost)}\n` +
          `- Amount Financed: ${currencyFormatter.format(result.amountFinanced)}\n` +
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

  const handleOptionSelect = (option: FinancingResults["alternatives"][number]) => {
    if (!selectedVehicle || !financingResults) {
      return;
    }

    navigate("/checkout", {
      state: {
        vehicle: selectedVehicle,
        option,
        summary: {
          monthlyPayment: financingResults.monthlyPayment,
          apr: financingResults.apr,
          totalCost: financingResults.totalCost,
          amountFinanced: financingResults.amountFinanced,
          recommendation: financingResults.recommendation,
        },
      },
    });
  };

  return (
    <Card className={`${className} h-full flex flex-col shadow-lg border-border/50`}>
      <CardHeader className="border-b bg-card">
        <CardTitle className="flex items-center gap-2 text-lg">
          {selectedVehicle ? (
            <>
              <span className="text-primary">•</span>
              {selectedVehicle.name}
            </>
          ) : (
            <>
              <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              </span>
              Toyota AI Assistant
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && !selectedVehicle && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Welcome to TalkToToyota</h3>
              <p className="text-muted-foreground mb-4">I'm your personal Toyota assistant. How can I help you today?</p>
              <div className="grid gap-2 max-w-sm mx-auto text-sm">
                <button 
                  onClick={() => setInput("What vehicles do you recommend for a family?")}
                  className="p-2 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-200"
                >
                  🚗 Find family-friendly vehicles
                </button>
                <button 
                  onClick={() => setInput("What hybrid options are available?")}
                  className="p-2 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-200"
                >
                  🔋 Explore hybrid vehicles
                </button>
                <button 
                  onClick={() => setInput("What's your most affordable SUV?")}
                  className="p-2 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-200"
                >
                  💰 Find budget-friendly SUVs
                </button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
          </div>
          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">Toyota Assistant is typing...</span>
            </div>
          )}
        </div>
        {selectedVehicle && !financingResults && (
          <div className="px-4 mb-2">
            <div className="rounded-xl border border-border/50 bg-card p-2 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
                </svg>
                <h3 className="font-semibold text-sm">Financing Checklist</h3>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  financingState.creditScore !== undefined 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-muted/30 border border-border/50 hover:border-primary/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium">Credit Score</span>
                      <p className="text-[10px] text-muted-foreground">Required • Step 1</p>
                    </div>
                    {financingState.creditScore !== undefined ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        {financingState.creditScore}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Pending</span>
                    )}
                  </div>
                </div>

                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  financingState.downPayment !== undefined 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-muted/30 border border-border/50 hover:border-primary/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium">Down Payment</span>
                      <p className="text-[10px] text-muted-foreground">Required • Step 2</p>
                    </div>
                    {financingState.downPayment !== undefined ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        ${new Intl.NumberFormat("en-US").format(financingState.downPayment)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Pending</span>
                    )}
                  </div>
                </div>

                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  financingState.loanTermMonths !== undefined 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-muted/30 border border-border/50 hover:border-primary/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium">Loan Term</span>
                      <p className="text-[10px] text-muted-foreground">Required • Step 3</p>
                    </div>
                    {financingState.loanTermMonths !== undefined ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        {financingState.loanTermMonths} months
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Pending</span>
                    )}
                  </div>
                </div>

                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  financingState.tradeInValue !== undefined 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-muted/30 border border-border/50 hover:border-primary/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium">Trade-In Value</span>
                      <p className="text-[10px] text-muted-foreground">Optional • Step 4</p>
                    </div>
                    {financingState.tradeInValue !== undefined ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                        ${new Intl.NumberFormat("en-US").format(financingState.tradeInValue)}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Not set</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {financingResults && financingResults.alternatives?.length > 0 && (
          <Card className="mb-4 bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Financing Options</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {financingResults.alternatives.map((option, index) => (
                <button
                  key={`${option.description}-${index}`}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className="rounded-lg border border-border bg-background p-3 text-left shadow-sm transition hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Option {index + 1}
                    {option.type === "base" ? " • Current selection" : ""}
                  </p>
                  <p className="text-sm font-semibold mt-1">{option.description}</p>
                  <div className="mt-3 space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Monthly Payment:</span>{" "}
                      {currencyFormatter.format(option.monthlyPayment)}
                    </div>
                    <div>
                      <span className="font-medium">APR:</span>{" "}
                      {option.apr !== undefined
                        ? `${aprFormatter.format(option.apr)}%`
                        : `${aprFormatter.format(financingResults.apr)}%`}
                    </div>
                    <div>
                      <span className="font-medium">Total Cost:</span>{" "}
                      {currencyFormatter.format(
                        option.totalCost ?? financingResults.totalCost
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Amount Financed:</span>{" "}
                      {currencyFormatter.format(
                        option.amountFinanced ?? financingResults.amountFinanced
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
        <div className="p-4 border-t border-border/50 bg-card">
          <div className="flex gap-2">
            <div className="flex-1 relative group">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedVehicle 
                  ? "Ask about features, financing, or specifications..." 
                  : "Ask about vehicles, compare models, or get recommendations..."}
                disabled={isLoading}
                className="pr-24 transition-all duration-200 border-border/50 hover:border-primary/30 focus:border-primary bg-background rounded-xl"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Press Enter ↵
              </div>
            </div>
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()}
              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
