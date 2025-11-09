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
  id:
    | "student"
    | "military"
    | "general"
    | "tradein"
    | "loyalty"
    | "eco"
    | "limitedStock"
    | "financingPartner"
    | "referral"
    | "maintenance";
  title: string;
  description: string;
  savingsAmount: number;
  deadlineHours: number;
}

interface CheckoutMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    incentiveId?: IncentiveOffer["id"];
    requiresConfirmation?: boolean;
  };
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
      description:
        "Lock in $500 in limited-time savings when you complete checkout before the weekend ends.",
      savingsAmount: 500,
      deadlineHours: 24,
    },
    tradein: {
      id: "tradein",
      title: "Trade-In Bonus",
      description:
        "Planning to trade in your old vehicle? Get up to $1,500 extra value when you trade in before this weekend.",
      savingsAmount: 1500,
      deadlineHours: 72,
    },
    loyalty: {
      id: "loyalty",
      title: "Toyota Loyalty Cash",
      description:
        "Already a Toyota owner? You may qualify for an additional $750 in loyalty savings on your next purchase.",
      savingsAmount: 750,
      deadlineHours: 48,
    },
    eco: {
      id: "eco",
      title: "Hybrid & EV Rebate",
      description:
        "Toyota is rewarding eco-friendly drivers with a $1,000 rebate on select hybrid or electric models.",
      savingsAmount: 1000,
      deadlineHours: 96,
    },
    limitedStock: {
      id: "limitedStock",
      title: "Limited Stock Priority Offer",
      description:
        "Only a few of these models are left in inventory — secure 0.9% APR financing and priority delivery if you checkout today.",
      savingsAmount: 500,
      deadlineHours: 24,
    },
    financingPartner: {
      id: "financingPartner",
      title: "Partner Financing Special",
      description:
        "Our financing partner is offering 0% APR for 36 months on select trims — finalize now to lock this in.",
      savingsAmount: 0,
      deadlineHours: 72,
    },
    referral: {
      id: "referral",
      title: "Refer-a-Friend Bonus",
      description:
        "If you were referred by a Toyota owner or refer a friend later, you'll both receive a $250 service credit.",
      savingsAmount: 250,
      deadlineHours: 120,
    },
    maintenance: {
      id: "maintenance",
      title: "ToyotaCare Plus Upgrade",
      description:
        "Enjoy an extra year of free scheduled maintenance when you complete your checkout this week.",
      savingsAmount: 300,
      deadlineHours: 96,
    },
  };

  const initialAssistantMessage =
    "Welcome back! I'm your Toyota checkout specialist. Are you a student, military member, trading in a vehicle, or a current Toyota owner? Let me know and I’ll flag the best incentives before we finish your checkout.";

  const [checkoutMessages, setCheckoutMessages] = useState<CheckoutMessage[]>([
    { role: "assistant", content: initialAssistantMessage, timestamp: new Date() },
  ]);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant" | "system"; content: string }>
  >([{ role: "assistant", content: initialAssistantMessage }]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState<IncentiveOffer | null>(null);
  const [pendingOffer, setPendingOffer] = useState<IncentiveOffer | null>(null);

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

  const detectOfferFromMessage = (content: string): IncentiveOffer | null | undefined => {
    const normalized = content.toLowerCase();
    const mentions = (...terms: string[]) => terms.some((term) => normalized.includes(term));

    if (
      /(not|no|neither|don't|do not).*(student|military|veteran|service member)/.test(normalized) ||
      mentions("no incentives", "no special offers", "don't qualify", "do not qualify", "nothing special")
    ) {
      return limitedTimeOffers.general;
    }

    if (mentions("student", "college", "graduate", "grad")) {
      return limitedTimeOffers.student;
    }

    if (mentions("military", "veteran", "service member", "armed forces")) {
      return limitedTimeOffers.military;
    }

    if (mentions("trade-in", "trade in", "tradein", "old car", "old vehicle", "trade my")) {
      return limitedTimeOffers.tradein;
    }

    if (
      mentions(
        "loyalty",
        "current toyota",
        "another toyota",
        "already own",
        "existing toyota",
        "returning customer",
        "toyota owner"
      )
    ) {
      return limitedTimeOffers.loyalty;
    }

    if (mentions("hybrid", "electric", "ev", "plug-in", "plug in", "eco", "emissions", "environmental")) {
      return limitedTimeOffers.eco;
    }

    if (
      mentions(
        "limited stock",
        "limited inventory",
        "few left",
        "last ones",
        "priority delivery",
        "priority build",
        "only a few"
      )
    ) {
      return limitedTimeOffers.limitedStock;
    }

    if (
      mentions(
        "0% apr",
        "zero apr",
        "0 apr",
        "special financing",
        "partner financing",
        "financing partner",
        "0.9% apr",
        "0% financing",
        "low apr"
      )
    ) {
      return limitedTimeOffers.financingPartner;
    }

    if (mentions("referral", "refer", "friend referred", "recommended me", "referred by")) {
      return limitedTimeOffers.referral;
    }

    if (mentions("maintenance", "toyotacare", "service plan", "service credit", "care plus", "scheduled maintenance")) {
      return limitedTimeOffers.maintenance;
    }

    if (mentions("deal", "today only", "flash sale", "special offer")) {
      return limitedTimeOffers.general;
    }

    return undefined;
  };

  const confirmationPrompt = (offer: IncentiveOffer) =>
    `It sounds like you qualify for the ${offer.title}. ${
      offer.savingsAmount > 0
        ? `That's worth ${currencyFormatter.format(offer.savingsAmount)} if you checkout within ${offer.deadlineHours} hours.`
        : `Lock it in within ${offer.deadlineHours} hours to secure this special offer.`
    } Just reply "Yes" and I'll apply it before you press Complete Checkout.`;

  const sendCheckoutMessage = async (contentOverride?: string): Promise<void> => {
    const messageContent = (contentOverride ?? chatInput).trim();
    if (!messageContent || isSending) {
      return;
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

    const affirmativePattern = /\b(yes|yep|yeah|sure|absolutely|apply|lock it in|let's do it|lets do it|confirm|sounds good|do it|count me in|ready)\b/i;
    const declinePattern = /\b(no|not now|no thanks|maybe later|another time|pass|skip|not yet|decline)\b/i;

    let nextAppliedOffer = appliedOffer;
    let nextPendingOffer = pendingOffer;

    const followupMessages: CheckoutMessage[] = [];
    const followupHistoryEntries: Array<{ role: "assistant" | "user" | "system"; content: string }> = [];

    if (pendingOffer) {
      const normalized = messageContent.toLowerCase();
      if (affirmativePattern.test(normalized)) {
        nextAppliedOffer = pendingOffer;
        nextPendingOffer = null;
        const confirmationText = `Fantastic! I've locked in the ${pendingOffer.title}. ${
          pendingOffer.savingsAmount > 0
            ? `Finish checkout within ${pendingOffer.deadlineHours} hours to keep the ${currencyFormatter.format(
                pendingOffer.savingsAmount
              )} savings.`
            : `Complete checkout within ${pendingOffer.deadlineHours} hours to secure this special offer.`
        } When you're ready, tap "Complete Checkout".`;
        const assistantAck: CheckoutMessage = {
          role: "assistant",
          content: confirmationText,
          timestamp: new Date(),
        };
        followupMessages.push(assistantAck);
        followupHistoryEntries.push({ role: "assistant", content: confirmationText });
      } else if (declinePattern.test(normalized)) {
        nextPendingOffer = null;
        const declineText = `No worries—I'll keep the ${pendingOffer.title} on standby. Let me know if you'd like me to add it later.`;
        const assistantAck: CheckoutMessage = {
          role: "assistant",
          content: declineText,
          timestamp: new Date(),
        };
        followupMessages.push(assistantAck);
        followupHistoryEntries.push({ role: "assistant", content: declineText });
      }
    }

    if (!nextPendingOffer) {
      const detectedOffer = detectOfferFromMessage(messageContent);
      if (
        detectedOffer &&
        (!nextAppliedOffer || nextAppliedOffer.id !== detectedOffer.id)
      ) {
        nextPendingOffer = detectedOffer;
        const promptText = confirmationPrompt(detectedOffer);
        const assistantPrompt: CheckoutMessage = {
          role: "assistant",
          content: promptText,
          timestamp: new Date(),
          metadata: {
            incentiveId: detectedOffer.id,
            requiresConfirmation: true,
          },
        };
        followupMessages.push(assistantPrompt);
        followupHistoryEntries.push({ role: "assistant", content: promptText });
      }
    }

    if (followupMessages.length > 0) {
      setCheckoutMessages((prev) => [...prev, ...followupMessages]);
    }

    if (nextAppliedOffer !== appliedOffer) {
      setAppliedOffer(nextAppliedOffer);
    }
    if (nextPendingOffer !== pendingOffer) {
      setPendingOffer(nextPendingOffer);
    }

    const workingHistory: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      ...conversationHistory,
      { role: "user", content: messageContent },
      ...followupHistoryEntries,
    ];
    const limitedHistory = workingHistory.slice(-12);
    setConversationHistory(limitedHistory);

    try {
      const response = await getCheckoutAIResponse({
        message: messageContent,
        context: {
          vehicle,
          financingSummary: summary,
          appliedOffer: nextAppliedOffer
            ? {
                title: nextAppliedOffer.title,
                description: nextAppliedOffer.description,
                savingsAmount: nextAppliedOffer.savingsAmount,
                deadlineHours: nextAppliedOffer.deadlineHours,
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

      let updatedHistory =
        response.conversationHistory ?? [...limitedHistory, { role: "assistant" as const, content: response.response }];
      updatedHistory = updatedHistory.slice(-12);
      setConversationHistory(updatedHistory);

      if (!nextPendingOffer) {
        const assistantDetectedOffer = detectOfferFromMessage(response.response);
        if (
          assistantDetectedOffer &&
          (!nextAppliedOffer || nextAppliedOffer.id !== assistantDetectedOffer.id)
        ) {
          nextPendingOffer = assistantDetectedOffer;
          const promptText = confirmationPrompt(assistantDetectedOffer);
          const promptMessage: CheckoutMessage = {
            role: "assistant",
            content: promptText,
            timestamp: new Date(),
            metadata: {
              incentiveId: assistantDetectedOffer.id,
              requiresConfirmation: true,
            },
          };
          setCheckoutMessages((prev) => [...prev, promptMessage]);
          setPendingOffer(assistantDetectedOffer);
          setConversationHistory((prev) => {
            const nextHistory = [...prev, { role: "assistant" as const, content: promptText }];
            return nextHistory.slice(-12);
          });
        }
      }

      if (nextPendingOffer !== pendingOffer) {
        setPendingOffer(nextPendingOffer);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Sorry, I ran into an unexpected error.";
      const assistantMessage: CheckoutMessage = {
        role: "assistant",
        content: `I couldn't reach our checkout specialist right now: ${errorMsg}`,
        timestamp: new Date(),
      };
      setCheckoutMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory((prev) => {
        const nextHistory = [...prev, { role: "assistant" as const, content: assistantMessage.content }];
        return nextHistory.slice(-12);
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendCheckoutMessage();
    }
  };

  const handleRemoveOffer = () => setAppliedOffer(null);

  return (
    <div className="container mx-auto max-w-6xl py-10 space-y-8">
      <div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          &larr; Back to Financing Options
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1.2fr]">
        <Card className="h-full">
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
                    label="Limited-Time Offer"
                    value={
                      appliedOffer.savingsAmount > 0
                        ? `-${currencyFormatter.format(appliedOffer.savingsAmount)}`
                        : appliedOffer.title
                    }
                    helperText={appliedOffer.description}
                  />
                  {appliedOffer.savingsAmount > 0 && (
                    <DetailBlock
                      label="Est. Total After Savings"
                      value={currencyFormatter.format(Math.max(adjustedTotalCost, 0))}
                      helperText={`Applies if completed within ${appliedOffer.deadlineHours} hours`}
                    />
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Checkout Specialist</CardTitle>
              <CardDescription>Chat with our AI closer to finish your purchase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-3 overflow-y-auto rounded-xl border border-border/40 bg-muted/30 p-4 min-h-[20rem] max-h-[30rem]">
                  {checkoutMessages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}-${message.timestamp.getTime()}`}
                      className={`inline-flex max-w-[92%] rounded-lg px-4 py-2 text-sm ${
                        message.role === "assistant"
                          ? "bg-background text-muted-foreground"
                          : "bg-primary text-primary-foreground ml-auto"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                  {isSending && (
                    <div className="inline-flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-sm text-muted-foreground shadow-inner">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Specialist is replying...</span>
                    </div>
                  )}
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
              </div>

              <Card className="h-full">
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

