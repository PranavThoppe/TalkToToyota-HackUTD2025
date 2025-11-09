import React, { createContext, useContext, useState } from 'react';
import { Vehicle } from '@/types/vehicle';

interface ComparisonContextType {
  compareMode: boolean;
  setCompareMode: (mode: boolean) => void;
  selectedVehicles: Vehicle[];
  addToComparison: (vehicle: Vehicle) => void;
  removeFromComparison: (vehicleId: string) => void;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);

  const addToComparison = (vehicle: Vehicle) => {
    if (selectedVehicles.length < 2 && !selectedVehicles.some(v => v.id === vehicle.id)) {
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };

  const removeFromComparison = (vehicleId: string) => {
    setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicleId));
  };

  const clearComparison = () => {
    setSelectedVehicles([]);
    setCompareMode(false);
  };

  return (
    <ComparisonContext.Provider
      value={{
        compareMode,
        setCompareMode,
        selectedVehicles,
        addToComparison,
        removeFromComparison,
        clearComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}