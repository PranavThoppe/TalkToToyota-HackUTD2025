import { Vehicle } from "@/types/vehicle";
import VehicleCard from "@/components/VehicleCard";
import { motion, AnimatePresence } from "framer-motion";

interface VehicleListProps {
  vehicles: Vehicle[];
  loading?: boolean;
}

export default function VehicleList({ vehicles, loading }: VehicleListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-muted-foreground">No vehicles found.</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {vehicles.map((vehicle, index) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
