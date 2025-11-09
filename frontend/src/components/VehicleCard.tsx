import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Vehicle } from "@/types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
  onClick?: () => void;
  isSelected?: boolean;
}
import { useComparison } from "@/context/ComparisonContext";
import { Plus, Check, ArrowLeftRight } from "lucide-react";

const VehicleCard = ({ vehicle, index, onClick }: VehicleCardProps) => {
  const { compareMode, selectedVehicles, addToComparison, removeFromComparison } = useComparison();

  const isSelected = selectedVehicles.some(v => v.id === vehicle.id);

  const handleClick = () => {
    if (compareMode) {
      if (isSelected) {
        removeFromComparison(vehicle.id);
      } else {
        addToComparison(vehicle);
      }
    } else {
      onClick?.();
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={[
        "bg-card rounded-lg overflow-hidden transition-shadow cursor-pointer relative z-0 border",
        isSelected
          ? "border-primary shadow-[var(--shadow-hover)] ring-2 ring-primary/60"
          : "border-transparent hover:shadow-[var(--shadow-hover)]",
      ].join(" ")}
      style={{ boxShadow: isSelected ? "var(--shadow-hover)" : "var(--shadow-card)" }}
      onClick={handleClick}
    >
      {isSelected && (
        <div className="absolute inset-0 bg-primary/5 pointer-events-none z-[2]" />
      )}
      <div className="relative">
        <div className="absolute top-4 left-4 z-[1] flex gap-2">
          {vehicle.badges.length > 0 && (
            <Badge className="bg-accent text-accent-foreground font-medium shadow-sm">
              {vehicle.badges[0]}
            </Badge>
          )}
        </div>
        {compareMode && (
          <div className="absolute top-4 right-4 z-[1]">
            <Badge 
              className={`${
                isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              } font-medium shadow-sm flex items-center gap-1`}
            >
              {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {isSelected ? 'Selected' : 'Compare'}
            </Badge>
          </div>
        )}
        <div className="aspect-[4/3] bg-white flex items-center justify-center p-8">
          <img
            src={`${import.meta.env.BASE_URL}${vehicle.image.startsWith('/') ? vehicle.image.slice(1) : vehicle.image}`}
            alt={vehicle.name}
            className="w-full h-full object-contain mix-blend-multiply"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error(`Failed to load image for ${vehicle.name}:`, target.src);
              target.onerror = null; // Prevent infinite loop
              target.src = '/images/vehicles/placeholder.png'; // You can add a placeholder image if needed
            }}
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
