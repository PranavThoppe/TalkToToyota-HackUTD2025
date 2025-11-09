import React from 'react';
import { Sheet } from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { Vehicle } from '../types/vehicle';

interface ComparisonViewProps {
  vehicles: Vehicle[];
  onClose: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ vehicles, onClose }) => {
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <Sheet>
        <div className="fixed inset-x-0 bottom-0 h-[85vh] rounded-t-[10px] bg-background border shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Vehicle Comparison</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 p-4">
            {vehicles.map((vehicle) => (
              <div 
                key={vehicle.id}
                className="relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow"
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="relative aspect-[16/9]">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{vehicle.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Starting at ${vehicle.price.toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {vehicle.badges?.map((badge: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedVehicle && (
            <Sheet>
              <ScrollArea className="h-[50vh] p-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{selectedVehicle.name} Specifications</h3>
                  
                  {selectedVehicle.specifications && (
                    <>
                      {selectedVehicle.specifications.mpg && (
                        <div>
                          <h4 className="font-medium">Fuel Economy</h4>
                          <p>City: {selectedVehicle.specifications.mpg.city} MPG</p>
                          <p>Highway: {selectedVehicle.specifications.mpg.highway} MPG</p>
                          <p>Combined: {selectedVehicle.specifications.mpg.combined} MPG</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {selectedVehicle.specifications.horsepower && (
                          <div>
                            <h4 className="font-medium">Horsepower</h4>
                            <p>{selectedVehicle.specifications.horsepower} hp</p>
                          </div>
                        )}
                        
                        {selectedVehicle.specifications.torque && (
                          <div>
                            <h4 className="font-medium">Torque</h4>
                            <p>{selectedVehicle.specifications.torque}</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium">Features</h4>
                        <ul className="list-disc pl-4">
                          {selectedVehicle.features?.map((feature: string, index: number) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </Sheet>
          )}
        </div>
      </Sheet>
    </div>
  );
};