import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Vehicle } from "@/types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
  onClick?: () => void;
}

const VehicleCard = ({ vehicle, index, onClick }: VehicleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-lg overflow-hidden hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
      style={{ boxShadow: "var(--shadow-card)" }}
      onClick={onClick}
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
      <div className="p-6">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground mb-1">
            {vehicle.priceRange || `$${vehicle.msrp.toLocaleString()} as shown*`}
          </p>
          <h3 className="text-2xl font-bold mb-2 text-card-foreground">
            {vehicle.name}
          </h3>
          {vehicle.year && (
            <p className="text-sm text-muted-foreground mb-3">{vehicle.year}</p>
          )}
          <div className="space-y-1">
            <p className="text-3xl font-bold text-card-foreground">
              ${vehicle.price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Starting MSRP*</p>
          </div>
        </div>
        
        {/* Key Specifications */}
        {vehicle.specifications && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {vehicle.specifications.mpg?.combined && (
                <div>
                  <p className="text-muted-foreground">MPG (Combined)</p>
                  <p className="font-semibold text-card-foreground">
                    {vehicle.specifications.mpg.combined}
                  </p>
                </div>
              )}
              {vehicle.specifications.horsepower && (
                <div>
                  <p className="text-muted-foreground">Horsepower</p>
                  <p className="font-semibold text-card-foreground">
                    {vehicle.specifications.horsepower} hp
                  </p>
                </div>
              )}
              {vehicle.specifications.seating && (
                <div>
                  <p className="text-muted-foreground">Seating</p>
                  <p className="font-semibold text-card-foreground">
                    {vehicle.specifications.seating} passengers
                  </p>
                </div>
              )}
              {vehicle.specifications.fuelType && (
                <div>
                  <p className="text-muted-foreground">Fuel Type</p>
                  <p className="font-semibold text-card-foreground">
                    {vehicle.specifications.fuelType}
                  </p>
                </div>
              )}
            </div>
            {vehicle.specifications.electricRange && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-muted-foreground text-sm">Electric Range</p>
                <p className="font-semibold text-card-foreground">
                  {vehicle.specifications.electricRange}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VehicleCard;
