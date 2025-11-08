export interface Vehicle {
  id: string;
  name: string;
  price: number;
  msrp: number;
  category: string;
  type: string;
  badges: string[];
  image: string;
  // Extended fields
  year?: number;
  priceRange?: string;
  specifications?: {
    mpg?: {
      city?: number;
      highway?: number;
      combined?: number;
    };
    horsepower?: number;
    torque?: string;
    seating?: number;
    fuelType?: string;
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    cargoSpace?: string;
    dimensions?: {
      length?: string;
      width?: string;
      height?: string;
      wheelbase?: string;
      groundClearance?: string;
      weight?: string;
    };
    safetyRating?: number;
    electricRange?: string;
    chargingTime?: string;
  };
  features?: string[];
  warranty?: string;
  bestFor?: string[];
  pros?: string[];
  cons?: string[];
  colors?: string[];
  trimLevels?: string[];
}
