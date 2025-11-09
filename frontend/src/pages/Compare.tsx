import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryTabs from "@/components/CategoryTabs";
import VehicleList from "@/components/vehicles/VehicleList";
import SearchBar from "@/components/SearchBar";
import VoiceAssistant from "@/components/voice/VoiceAssistant";
import ChatInterface from "@/components/chat/ChatInterface";
import { useVehicles } from "@/hooks/useFirebase";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types/vehicle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = [
  "Cars & Minivan",
  "Trucks",
  "Crossovers & SUVs",
  "Electrified",
];

const filterVehicles = (vehicles: Vehicle[], query: string): Vehicle[] => {
  if (!query) return vehicles;

  const lowerQuery = query.toLowerCase();

  const priceMatch = lowerQuery.match(/under\s+\$?(\d+)k?/);
  if (priceMatch) {
    const maxPrice = parseInt(priceMatch[1]) * 1000;
    return vehicles.filter((v) => v.price <= maxPrice);
  }

  if (lowerQuery.includes("hybrid")) {
    return vehicles.filter(
      (v) =>
        v.type === "hybrid" ||
        v.type === "plug-in-hybrid" ||
        v.specifications?.fuelType?.toLowerCase().includes("hybrid") ||
        v.badges.some((b) => b.toLowerCase().includes("hybrid"))
    );
  }
  if (lowerQuery.includes("electric")) {
    return vehicles.filter(
      (v) =>
        v.type === "electric" ||
        v.specifications?.fuelType?.toLowerCase().includes("electric") ||
        v.badges.some((b) => b.toLowerCase().includes("electric"))
    );
  }
  if (lowerQuery.includes("suv")) {
    return vehicles.filter((v) => v.type === "suv" || v.type === "wagon");
  }
  if (lowerQuery.includes("truck")) {
    return vehicles.filter((v) => v.type === "truck");
  }
  if (lowerQuery.includes("sedan")) {
    return vehicles.filter((v) => v.type === "sedan");
  }
  if (lowerQuery.includes("sports") || lowerQuery.includes("performance")) {
    return vehicles.filter(
      (v) =>
        v.type === "sports-car" ||
        v.badges.some((b) => b.toLowerCase().includes("performance"))
    );
  }

  return vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(lowerQuery) ||
      v.specifications?.fuelType?.toLowerCase().includes(lowerQuery) ||
      (v.specifications?.engine &&
        v.specifications.engine.toLowerCase().includes(lowerQuery))
  );
};

const Compare = () => {
  const [activeCategory, setActiveCategory] = useState("Cars & Minivan");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
  const { vehicles, loading } = useVehicles(activeCategory);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredVehicles = useMemo(
    () => filterVehicles(vehicles, searchQuery),
    [vehicles, searchQuery]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    toast({
      title: "Search applied",
      description: `Showing ${filterVehicles(vehicles, query).length} vehicles for your request`,
    });
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicles((prev) => {
      const alreadySelected = prev.some((v) => v.id === vehicle.id);

      if (alreadySelected) {
        toast({
          title: "Removed from comparison",
          description: `${vehicle.name} will not be compared.`,
        });
        return prev.filter((v) => v.id !== vehicle.id);
      }

      if (prev.length >= 2) {
        toast({
          title: "Compare limit reached",
          description: "You can only compare two vehicles at a time.",
        });
        return prev;
      }

      const next = [...prev, vehicle];
      toast({
        title: `${vehicle.name} added`,
        description:
          next.length === 2
            ? "Preparing your side-by-side comparison..."
            : "Select one more vehicle to compare.",
      });
      return next;
    });
  };

  useEffect(() => {
    if (selectedVehicles.length === 2) {
      const ids = selectedVehicles.map((v) => v.id).join(",");
      const timeout = setTimeout(() => {
        navigate(`/compare/results?vehicles=${ids}`);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [selectedVehicles, navigate]);

  return (
    <div className="min-h-screen bg-background pb-[15vh] relative">
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-6">
          <h1 className="text-4xl font-bold text-foreground">Toyota Compare</h1>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-base px-4 py-2">
              Selected {selectedVehicles.length}/2
            </Badge>
            <Button variant="ghost" onClick={() => navigate("/")}>
              Exit Compare
            </Button>
          </div>
        </div>
      </header>

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setSearchQuery("");
        }}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-6 rounded-lg border border-dashed border-primary/40 bg-primary/10 px-4 py-4 text-sm text-foreground shadow-sm">
          <p className="font-semibold text-base">
            Select two vehicles to compare them side by side.
          </p>
          <p className="text-muted-foreground mt-1">
            Tap a vehicle card to add or remove it from your comparison. Once
            two vehicles are selected, we&apos;ll take you straight to the
            comparison view.
          </p>
          {selectedVehicles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedVehicles.map((vehicle) => (
                <Badge key={vehicle.id} variant="outline">
                  {vehicle.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {activeCategory}
          </h2>
          <p className="text-sm text-muted-foreground">
            Images do not depict actual vehicles being offered by dealers and
            are shown for illustrative purposes only.
          </p>
        </div>

        <VehicleList
          vehicles={filteredVehicles}
          loading={loading}
          onVehicleClick={handleVehicleSelect}
          selectedVehicleIds={selectedVehicles.map((v) => v.id)}
        />
      </main>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voice">Voice Assistant</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="voice" className="mt-4">
            <VoiceAssistant vehicles={vehicles} currentCategory={activeCategory} />
          </TabsContent>
          <TabsContent value="chat" className="mt-4">
            <ChatInterface vehicles={vehicles} currentCategory={activeCategory} />
          </TabsContent>
        </Tabs>
      </div>

      <SearchBar onSearch={handleSearch} />
    </div>
  );
};

export default Compare;

