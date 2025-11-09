import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VehicleCard from "@/components/VehicleCard";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import VoiceAssistant from "@/components/voice/VoiceAssistant";
import ChatInterface from "@/components/chat/ChatInterface";
import VehicleList from "@/components/vehicles/VehicleList";
import VehicleDetail from "@/components/vehicles/VehicleDetail";
import ComparisonView from "@/components/vehicles/ComparisonView";
import { ComparisonProvider, useComparison } from "@/context/ComparisonContext";
import { useVehicles } from "@/hooks/useFirebase";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types/vehicle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight } from "lucide-react";

function IndexContent() {
  const [activeCategory, setActiveCategory] = useState("Cars & Minivan");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();
  const { vehicles, loading } = useVehicles(activeCategory);
  const { compareMode, selectedVehicles, clearComparison, setCompareMode } = useComparison();

  const categories = [
    "Cars & Minivan",
    "Trucks",
    "Crossovers & SUVs",
    "Electrified",
  ];

  // Simple AI simulation for filtering
  const filterVehicles = (vehicles: Vehicle[], query: string): Vehicle[] => {
    if (!query) return vehicles;

    const lowerQuery = query.toLowerCase();

    // Price filtering
    const priceMatch = lowerQuery.match(/under\s+\$?(\d+)k?/);
    if (priceMatch) {
      const maxPrice = parseInt(priceMatch[1]) * 1000;
      return vehicles.filter((v) => v.price <= maxPrice);
    }

    // Type filtering
    if (lowerQuery.includes("hybrid")) {
      return vehicles.filter(
        (v) => v.type === "hybrid" || 
               v.type === "plug-in-hybrid" ||
               v.specifications?.fuelType?.toLowerCase().includes("hybrid") ||
               v.badges.some(b => b.toLowerCase().includes("hybrid"))
      );
    }
    if (lowerQuery.includes("electric")) {
      return vehicles.filter(
        (v) => v.type === "electric" ||
               v.specifications?.fuelType?.toLowerCase().includes("electric") ||
               v.badges.some(b => b.toLowerCase().includes("electric"))
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
      return vehicles.filter((v) => v.type === "sports-car" || v.badges.some(b => b.toLowerCase().includes("performance")));
    }

    // Name and model search
    return vehicles.filter((v) =>
      v.name.toLowerCase().includes(lowerQuery) ||
      v.specifications?.fuelType?.toLowerCase().includes(lowerQuery) ||
      (v.specifications?.engine && v.specifications.engine.toLowerCase().includes(lowerQuery))
    );
  };

  const filteredVehicles = useMemo(() => {
    return filterVehicles(vehicles, searchQuery);
  }, [vehicles, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    toast({
      title: "Search applied",
      description: `Found ${filteredVehicles.length} vehicles matching your criteria`,
    });
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    if (compareMode) return; // Don't select vehicle in compare mode
    setSelectedVehicle(vehicle);
  };

  const handleCloseDetail = () => {
    setSelectedVehicle(null);
  };

  const handleCloseComparison = () => {
    clearComparison();
  };

  const handleAddToCart = () => {
    if (selectedVehicle) {
      toast({
        title: "Added to Cart",
        description: `${selectedVehicle.name} has been added to your cart!`,
      });
      // Here you would typically add to cart state/context
    }
  };

  return (
    <div className="min-h-screen bg-background pb-[15vh] relative">
      {compareMode && selectedVehicles.length === 2 ? (
        <div className="container mx-auto px-4 py-8">
          <ComparisonView
            vehicles={selectedVehicles}
            onClose={handleCloseComparison}
            className="w-full"
          />
        </div>
      ) : selectedVehicle ? (
        <>
          {/* Vehicle Detail Panel - Left Side */}
          <VehicleDetail
            vehicle={selectedVehicle}
            onClose={handleCloseDetail}
            onAddToCart={handleAddToCart}
          />
          
          {/* AI Salesman Section - Right Side */}
          <div className="fixed right-0 top-0 h-screen w-full lg:w-[calc(100%-450px)] bg-background z-30 flex flex-col">
            <div className="border-b border-border bg-card p-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-foreground">
                Talk to our AI Salesman about {selectedVehicle.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ask questions, learn about features, and get personalized recommendations
              </p>
            </div>
            <div className="flex-1 overflow-hidden p-4 min-h-0">
              <ChatInterface
                vehicles={vehicles}
                currentCategory={activeCategory}
                selectedVehicle={selectedVehicle}
                className="h-full"
              />
            </div>
          </div>
          
          {/* Overlay for mobile */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={handleCloseDetail}
          />
        </>
      ) : (
        /* Normal View Mode - When no vehicle selected */
        <>
          {/* Header */}
          <header className="border-b border-border bg-card sticky top-0 z-30">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-4xl font-bold text-foreground">Toyota</h1>
            </div>
          </header>

          {/* Category Tabs and Compare Button */}
          <div className="flex items-center justify-between border-b border-border bg-card p-4">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={(cat) => {
                setActiveCategory(cat);
                setSearchQuery("");
              }}
            />
            <button
              onClick={() => {
                if (compareMode) {
                  clearComparison();
                } else {
                  setCompareMode(true);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                compareMode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="font-medium">
                {compareMode ? 'Cancel Comparison' : 'Compare Vehicles'}
              </span>
            </button>
          </div>

          {/* Vehicle Grid Section */}
          <main className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {activeCategory}
              </h2>
              {compareMode && (
                <p className="text-sm font-medium text-primary mb-2">
                  Select up to two vehicles to compare ({selectedVehicles.length}/2)
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Images do not depict actual vehicles being offered by dealers and
                are shown for illustrative purposes only.
              </p>
            </div>

            {/* Vehicle Grid */}
            <VehicleList
              vehicles={filteredVehicles}
              loading={loading}
              onVehicleClick={handleVehicleClick}
            />
          </main>

          {/* AI Assistant Section */}
          {!compareMode && (
            <div className="container mx-auto px-4 py-8">
              <Tabs defaultValue="voice" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="voice">Voice Assistant</TabsTrigger>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
                <TabsContent value="voice" className="mt-4">
                  <VoiceAssistant
                    vehicles={vehicles}
                    currentCategory={activeCategory}
                  />
                </TabsContent>
                <TabsContent value="chat" className="mt-4">
                  <ChatInterface
                    vehicles={vehicles}
                    currentCategory={activeCategory}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Persistent Search Bar */}
          <SearchBar onSearch={handleSearch} />
        </>
      )}
    </div>
  );
}

export default function Index() {
  return (
    <ComparisonProvider>
      <IndexContent />
    </ComparisonProvider>
  );
}