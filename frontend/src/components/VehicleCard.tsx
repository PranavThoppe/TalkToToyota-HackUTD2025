import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Vehicle } from "@/types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
}

const VehicleCard = ({ vehicle, index }: VehicleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-lg overflow-hidden hover:shadow-[var(--shadow-hover)] transition-shadow"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="relative">
        {vehicle.badges.length > 0 && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-accent text-accent-foreground font-medium">
              {vehicle.badges[0]}
            </Badge>
          </div>
        )}
        <div className="aspect-[4/3] bg-muted flex items-center justify-center p-8">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">
          ${vehicle.msrp.toLocaleString()} as shown*
        </p>
        <h3 className="text-2xl font-bold mb-4 text-card-foreground">
          {vehicle.name}
        </h3>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-card-foreground">
            ${vehicle.price.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Starting MSRP*</p>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
