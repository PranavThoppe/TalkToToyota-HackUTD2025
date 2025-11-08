import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VehicleCard from "@/components/VehicleCard";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import VoiceAssistant from "@/components/voice/VoiceAssistant";
import ChatInterface from "@/components/chat/ChatInterface";
import VehicleList from "@/components/vehicles/VehicleList";
import { useVehicles } from "@/hooks/useFirebase";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types/vehicle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("Cars & Minivan");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { vehicles, loading } = useVehicles(activeCategory);

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
        (v) => v.type === "hybrid" || v.type === "plug-in-hybrid"
      );
    }
    if (lowerQuery.includes("electric")) {
      return vehicles.filter((v) => v.type === "electric");
    }
    if (lowerQuery.includes("suv")) {
      return vehicles.filter((v) => v.type === "suv");
    }
    if (lowerQuery.includes("truck")) {
      return vehicles.filter((v) => v.type === "truck");
    }

    // Name search
    return vehicles.filter((v) =>
      v.name.toLowerCase().includes(lowerQuery)
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

  return (
    <div className="min-h-screen bg-background pb-[15vh]">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-foreground">Toyota</h1>
        </div>
      </header>

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setSearchQuery("");
        }}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {activeCategory}
          </h2>
          <p className="text-sm text-muted-foreground">
            Images do not depict actual vehicles being offered by dealers and
            are shown for illustrative purposes only.
          </p>
        </div>

        {/* Vehicle Grid */}
        <VehicleList vehicles={filteredVehicles} loading={loading} />
      </main>

      {/* AI Assistant Section */}
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

      {/* Persistent Search Bar */}
      <SearchBar onSearch={handleSearch} />
    </div>
  );
};

export default Index;
