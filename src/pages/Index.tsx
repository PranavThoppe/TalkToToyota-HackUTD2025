import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VehicleCard from "@/components/VehicleCard";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import vehiclesData from "@/data/vehicles.json";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  name: string;
  price: number;
  msrp: number;
  category: string;
  type: string;
  badges: string[];
  image: string;
}

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("Cars & Minivan");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

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
    const categoryFiltered = (vehiclesData as Vehicle[]).filter(
      (v) => v.category === activeCategory
    );
    return filterVehicles(categoryFiltered, searchQuery);
  }, [activeCategory, searchQuery]);

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
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVehicles.map((vehicle, index) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredVehicles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-xl text-muted-foreground">
              No vehicles found. Try a different search.
            </p>
          </motion.div>
        )}
      </main>

      {/* Persistent Search Bar */}
      <SearchBar onSearch={handleSearch} />
    </div>
  );
};

export default Index;
