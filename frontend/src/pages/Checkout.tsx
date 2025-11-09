import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Vehicle } from "@/types/vehicle";
import type { FinancingAlternative } from "@/services/api";

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
                {option.type && <Badge variant="secondary">{option.type}</Badge>}
                <p className="text-muted-foreground text-sm">
                  {summary.recommendation ??
                    "Review these financing details and proceed to secure your vehicle."}
                </p>
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
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
};

interface DetailBlockProps {
  label: string;
  value: string;
}

const DetailBlock = ({ label, value }: DetailBlockProps) => (
  <div className="rounded-lg border border-dashed border-border p-4">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default Checkout;

