import { useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useVehicles } from "@/hooks/useFirebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Vehicle } from "@/types/vehicle";
import ChatInterface from "@/components/chat/ChatInterface";

const comparisonRows: {
  label: string;
  getValue: (vehicle: Vehicle | undefined) => string;
}[] = [
  {
    label: "Starting MSRP",
    getValue: (vehicle) =>
      vehicle ? `$${vehicle.price.toLocaleString()}` : "—",
  },
  {
    label: "Price Range",
    getValue: (vehicle) => vehicle?.priceRange ?? "—",
  },
  {
    label: "Fuel Type",
    getValue: (vehicle) => vehicle?.specifications?.fuelType ?? "—",
  },
  {
    label: "Horsepower",
    getValue: (vehicle) =>
      vehicle?.specifications?.horsepower
        ? `${vehicle.specifications.horsepower} hp`
        : "—",
  },
  {
    label: "Torque",
    getValue: (vehicle) => vehicle?.specifications?.torque ?? "—",
  },
  {
    label: "MPG (Combined)",
    getValue: (vehicle) =>
      vehicle?.specifications?.mpg?.combined
        ? `${vehicle.specifications.mpg.combined}`
        : "—",
  },
  {
    label: "Seating",
    getValue: (vehicle) =>
      vehicle?.specifications?.seating
        ? `${vehicle.specifications.seating} passengers`
        : "—",
  },
  {
    label: "Drivetrain",
    getValue: (vehicle) => vehicle?.specifications?.drivetrain ?? "—",
  },
  {
    label: "Transmission",
    getValue: (vehicle) => vehicle?.specifications?.transmission ?? "—",
  },
  {
    label: "Engine",
    getValue: (vehicle) => vehicle?.specifications?.engine ?? "—",
  },
  {
    label: "Electric Range",
    getValue: (vehicle) => vehicle?.specifications?.electricRange ?? "—",
  },
  {
    label: "Warranty",
    getValue: (vehicle) => vehicle?.warranty ?? "—",
  },
];

const CompareResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehiclesParam = searchParams.get("vehicles");
  const chatSectionRef = useRef<HTMLDivElement | null>(null);
  const selectedIds = useMemo(
    () =>
      vehiclesParam
        ? vehiclesParam
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
        : [],
    [vehiclesParam]
  );

  const { vehicles, loading } = useVehicles();

  const selectedVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) => selectedIds.includes(vehicle.id)).slice(0, 2),
    [vehicles, selectedIds]
  );

  const [primary, secondary] = selectedVehicles;

  const shouldShowComparison =
    !loading && selectedIds.length === 2 && selectedVehicles.length === 2;

  const handleScrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              Toyota
            </p>
            <h1 className="text-4xl font-bold text-foreground">
              Vehicle Comparison
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/compare")}>
              Start New Compare
            </Button>
            <Button onClick={() => navigate("/")}>Back to Browse</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-10">
        {!vehiclesParam || selectedIds.length !== 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>Need two vehicles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Choose exactly two vehicles to compare. Head back to the compare
                page to make your selections.
              </p>
              <Button onClick={() => navigate("/compare")}>
                Go to Compare
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Loading comparison data...
            </CardContent>
          </Card>
        ) : !shouldShowComparison ? (
          <Card>
            <CardHeader>
              <CardTitle>Vehicles not found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We couldn&apos;t load both vehicles. They might have been
                removed or are unavailable. Please try selecting again.
              </p>
              <Button onClick={() => navigate("/compare")}>
                Choose Vehicles Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleScrollToChat}>
                Chat with a Salesman
              </Button>
            </div>

            <section className="grid gap-6 md:grid-cols-2">
              {[primary, secondary].map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {vehicle.year && (
                          <p className="text-sm text-muted-foreground">
                            {vehicle.year}
                          </p>
                        )}
                        <CardTitle className="text-3xl font-bold">
                          {vehicle.name}
                        </CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-base">
                        ${vehicle.price.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Starting MSRP*
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={`${import.meta.env.BASE_URL}${
                          vehicle.image.startsWith("/")
                            ? vehicle.image.slice(1)
                            : vehicle.image
                        }`}
                        alt={vehicle.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {vehicle.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {vehicle.badges.map((badge, idx) => (
                          <Badge key={idx} variant="outline">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {vehicle.features && vehicle.features.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Highlights
                        </h3>
                        <ul className="space-y-1 text-sm text-foreground/90">
                          {vehicle.features.slice(0, 6).map((feature, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-primary">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </section>

            <section>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Side-by-side specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border px-4 py-3 text-left font-semibold text-muted-foreground">
                          Specification
                        </th>
                        <th className="border border-border px-4 py-3 text-left font-semibold">
                          {primary.name}
                        </th>
                        <th className="border border-border px-4 py-3 text-left font-semibold">
                          {secondary.name}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.label} className="odd:bg-background even:bg-muted/40">
                          <td className="border border-border px-4 py-3 font-medium text-muted-foreground">
                            {row.label}
                          </td>
                          <td className="border border-border px-4 py-3">
                            {row.getValue(primary)}
                          </td>
                          <td className="border border-border px-4 py-3">
                            {row.getValue(secondary)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </section>

            {(primary.bestFor?.length || secondary.bestFor?.length) && (
              <section className="grid gap-6 md:grid-cols-2">
                {[primary, secondary].map((vehicle) => (
                  <Card key={`${vehicle.id}-best-for`}>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {vehicle.name} is best for
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {vehicle.bestFor && vehicle.bestFor.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {vehicle.bestFor.map((useCase, idx) => (
                            <Badge key={idx} variant="secondary">
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No highlights available.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </section>
            )}

            <Separator />

            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => navigate("/compare")}>
                Compare different vehicles
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Return to home
              </Button>
            </div>

            <section ref={chatSectionRef} className="pt-16" aria-labelledby="chat-section-title">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)]">
                <ChatInterface
                  vehicles={vehicles}
                  compareVehicles={selectedVehicles}
                  className="max-w-4xl mx-auto"
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default CompareResults;

