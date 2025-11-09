import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { getCheckoutAIResponse } from "@/services/api";
import type { Vehicle } from "@/types/vehicle";
import type { FinancingAlternative } from "@/services/api";

interface IncentiveOffer {
  id: "student" | "military" | "general";
  title: string;
  description: string;
  savingsAmount: number;
  deadlineHours: number;
}

interface CheckoutMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CheckoutLocationState {
  vehicle?: Vehicle;
  option?: FinancingAlternative;
  summary?: {
    monthlyPayment: number;
    apr: number;
    totalCost: number;
    amountFinanced: number;
    recommendation?: string;
  };
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as CheckoutLocationState | undefined) ?? {};

  const { vehicle, option, summary } = state;

  const limitedTimeOffers: Record<IncentiveOffer["id"], IncentiveOffer> = {
    student: {
      id: "student",
      title: "College Graduate Rebate",
      description:
        "Toyota is celebrating students with a $750 rebate when you finalize your purchase during this event.",
      savingsAmount: 750,
      deadlineHours: 48,
    },
    military: {
      id: "military",
      title: "Military Appreciation Bonus",
      description:
        "Active duty, reservists, and veterans receive $1,000 bonus cash as a thank-you for your service.",
      savingsAmount: 1000,
      deadlineHours: 72,
    },
    general: {
      id: "general",
      title: "Flash Sales Bonus",
      description: "Lock in $500 in limited-time savings when you complete checkout before the weekend ends.",
      savingsAmount: 500,
      deadlineHours: 24,
    },
  };

  const initialAssistantMessage =
    "Welcome back! I'm your Toyota checkout specialist. Let me know if you're ready to wrap things up or if there's anything I can answer before you hit Complete Checkout.";

  const [checkoutMessages, setCheckoutMessages] = useState<CheckoutMessage[]>([
    { role: "assistant", content: initialAssistantMessage, timestamp: new Date() },
  ]);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant" | "system"; content: string }>
  >([{ role: "assistant", content: initialAssistantMessage }]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState<IncentiveOffer | null>(null);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );

  const aprFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    []
  );

  if (!vehicle || !option || !summary) {
    return (
      <div className="container mx-auto max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Checkout Details Not Found</CardTitle>
            <CardDescription>
              We couldn&apos;t find the financing option you were looking for. Please return to the chat to
              select an option.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button onClick={() => navigate("/")}>Return to Vehicles</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adjustedTotalCost = summary.totalCost - (appliedOffer?.savingsAmount ?? 0);

  const sendCheckoutMessage = async (
    contentOverride?: string,
    offerOverride?: IncentiveOffer | null
  ): Promise<void> => {
    const messageContent = (contentOverride ?? chatInput).trim();
    if (!messageContent || isSending) {
      return;
    }

    if (offerOverride !== undefined) {
      setAppliedOffer(offerOverride);
    }

    const userMessage: CheckoutMessage = {
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setCheckoutMessages((prev) => [...prev, userMessage]);
    if (!contentOverride) {
      setChatInput("");
    }
    setIsSending(true);

    const nextHistory = [
      ...conversationHistory,
      { role: "user" as const, content: messageContent },
    ];
    const limitedHistory = nextHistory.slice(-12);
    setConversationHistory(limitedHistory);

    try {
      const activeOffer = offerOverride !== undefined ? offerOverride : appliedOffer;
      const response = await getCheckoutAIResponse({
        message: messageContent,
        context: {
          vehicle,
          financingSummary: summary,
          appliedOffer: activeOffer
            ? {
                title: activeOffer.title,
                savingsAmount: activeOffer.savingsAmount,
                deadlineHours: activeOffer.deadlineHours,
              }
            : undefined,
        },
        conversationHistory: limitedHistory,
      });

      const assistantMessage: CheckoutMessage = {
        role: "assistant",
        content: response.response,
        timestamp: new Date(),
      };

      setCheckoutMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory(
        response.conversationHistory ?? [
          ...limitedHistory,
          { role: "assistant" as const, content: response.response },
        ]
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Sorry, I ran into an unexpected error.";
      const assistantMessage: CheckoutMessage = {
        role: "assistant",
        content: `I couldn't reach our checkout specialist right now: ${errorMsg}`,
        timestamp: new Date(),
      };
      setCheckoutMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant" as const, content: assistantMessage.content },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = (selection: "student" | "military" | "none") => {
    if (isSending) return;
    const offer =
      selection === "student"
        ? limitedTimeOffers.student
        : selection === "military"
        ? limitedTimeOffers.military
        : limitedTimeOffers.general;

    const message =
      selection === "student"
        ? "I qualify for the student savings program."
        : selection === "military"
        ? "I'm eligible for the military appreciation offer."
        : "I don't qualify for student or military incentives.";

    void sendCheckoutMessage(message, offer);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendCheckoutMessage();
    }
  };

  const handleRemoveOffer = () => setAppliedOffer(null);

  return (
    <div className="container mx-auto max-w-4xl py-10 space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          &larr; Back to Financing Options
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{vehicle.name}</CardTitle>
            <CardDescription>
              Finalize your financing plan and review the details for the {vehicle.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">{option.description}</h3>
              </div>
              {vehicle.image && (
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="h-32 w-48 rounded-lg object-cover shadow"
                />
              )}
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailBlock label="Monthly Payment" value={currencyFormatter.format(option.monthlyPayment)} />
              <DetailBlock
                label="APR"
                value={
                  option.apr !== undefined
                    ? `${aprFormatter.format(option.apr)}%`
                    : `${aprFormatter.format(summary.apr)}%`
                }
              />
              <DetailBlock
                label="Total Cost"
                value={currencyFormatter.format(option.totalCost ?? summary.totalCost)}
              />
              <DetailBlock
                label="Amount Financed"
                value={currencyFormatter.format(option.amountFinanced ?? summary.amountFinanced)}
              />
              {option.loanTermMonths && <DetailBlock label="Loan Term" value={`${option.loanTermMonths} months`} />}
              {option.downPayment !== undefined && (
                <DetailBlock label="Down Payment" value={currencyFormatter.format(option.downPayment)} />
              )}
              {appliedOffer && (
                <>
                  <DetailBlock
                    label="Limited-Time Savings"
                    value={`-${currencyFormatter.format(appliedOffer.savingsAmount)}`}
                    helperText={appliedOffer.title}
                  />
                  <DetailBlock
                    label="Est. Total After Savings"
                    value={currencyFormatter.format(Math.max(adjustedTotalCost, 0))}
                    helperText={`Applies if completed within ${appliedOffer.deadlineHours} hours`}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>Provide a few more details to reserve this offer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li>• Verify personal information</li>
                <li>• Upload required documents</li>
                <li>• Schedule pickup or delivery</li>
                <li>• Sign electronically or in-dealership</li>
              </ul>
              <Button className="w-full" size="lg">
                Complete Checkout
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Checkout Specialist</CardTitle>
              <CardDescription>Chat with our AI closer to finish your purchase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border/40 bg-muted/30 p-3">
                  {checkoutMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}-${message.timestamp.getTime()}`}
                      className={`inline-flex max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        message.role === "assistant"
                          ? "bg-background text-muted-foreground"
                          : "bg-primary text-primary-foreground ml-auto"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                  {isSending && (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Specialist is replying...</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReply("student")}
                    disabled={isSending}
                  >
                    I'm a student
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReply("military")}
                    disabled={isSending}
                  >
                    I'm military
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickReply("none")}
                    disabled={isSending}
                  >
                    No special incentives
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about final steps, timing, or remaining questions..."
                  disabled={isSending}
                />
                <Button
                  onClick={() => void sendCheckoutMessage()}
                  disabled={isSending || !chatInput.trim()}
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {appliedOffer && (
                <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                  <div>
                    Savings locked! {appliedOffer.title} is applied. Complete checkout within{" "}
                    {appliedOffer.deadlineHours} hours to keep the additional{" "}
                    ${appliedOffer.savingsAmount.toLocaleString()}.
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start text-primary hover:bg-primary/10"
                    onClick={handleRemoveOffer}
                  >
                    Remove incentive
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface DetailBlockProps {
  label: string;
  value: string;
  helperText?: string;
}

const DetailBlock = ({ label, value, helperText }: DetailBlockProps) => (
  <div className="rounded-lg border border-dashed border-border p-4">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
    {helperText && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
  </div>
);

export default Checkout;

