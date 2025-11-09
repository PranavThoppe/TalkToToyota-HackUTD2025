import { Vehicle } from "@/types/vehicle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VehicleSpecsDrawerProps {
  vehicle: Vehicle;
  open: boolean;
  onClose: () => void;
}

export default function VehicleSpecsDrawer({ vehicle, open, onClose }: VehicleSpecsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full lg:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>{vehicle.name} Specifications</SheetTitle>
          <SheetDescription>
            {vehicle.year} Model • Starting at ${vehicle.price.toLocaleString()}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6">
            {/* Key Features */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Features</h3>
              <div className="flex flex-wrap gap-2">
                {vehicle.badges.map((badge, index) => (
                  <Badge key={index} variant="outline">{badge}</Badge>
                ))}
              </div>
            </div>

            {/* Performance */}
            {vehicle.specifications && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {vehicle.specifications.horsepower && (
                      <div>
                        <p className="text-sm text-muted-foreground">Horsepower</p>
                        <p className="font-semibold">{vehicle.specifications.horsepower} hp</p>
                      </div>
                    )}
                    {vehicle.specifications.torque && (
                      <div>
                        <p className="text-sm text-muted-foreground">Torque</p>
                        <p className="font-semibold">{vehicle.specifications.torque} lb-ft</p>
                      </div>
                    )}
                    {vehicle.specifications.acceleration && (
                      <div>
                        <p className="text-sm text-muted-foreground">0-60 MPH</p>
                        <p className="font-semibold">{vehicle.specifications.acceleration}s</p>
                      </div>
                    )}
                    {vehicle.specifications.transmission && (
                      <div>
                        <p className="text-sm text-muted-foreground">Transmission</p>
                        <p className="font-semibold">{vehicle.specifications.transmission}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Efficiency */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Efficiency</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {vehicle.specifications.mpg && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">City MPG</p>
                          <p className="font-semibold">{vehicle.specifications.mpg.city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Highway MPG</p>
                          <p className="font-semibold">{vehicle.specifications.mpg.highway}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Combined MPG</p>
                          <p className="font-semibold">{vehicle.specifications.mpg.combined}</p>
                        </div>
                      </>
                    )}
                    {vehicle.specifications.fuelType && (
                      <div>
                        <p className="text-sm text-muted-foreground">Fuel Type</p>
                        <p className="font-semibold">{vehicle.specifications.fuelType}</p>
                      </div>
                    )}
                    {vehicle.specifications.electricRange && (
                      <div>
                        <p className="text-sm text-muted-foreground">Electric Range</p>
                        <p className="font-semibold">{vehicle.specifications.electricRange}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interior */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Interior</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {vehicle.specifications.seating && (
                      <div>
                        <p className="text-sm text-muted-foreground">Seating</p>
                        <p className="font-semibold">{vehicle.specifications.seating} passengers</p>
                      </div>
                    )}
                    {vehicle.specifications.cargoSpace && (
                      <div>
                        <p className="text-sm text-muted-foreground">Cargo Space</p>
                        <p className="font-semibold">{vehicle.specifications.cargoSpace} cu.ft.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Available Packages */}
            {vehicle.packages && vehicle.packages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Available Packages</h3>
                <div className="space-y-3">
                  {vehicle.packages.map((pkg, index) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <p className="font-medium">{pkg.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                      <p className="text-sm font-medium mt-2">
                        +${pkg.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}