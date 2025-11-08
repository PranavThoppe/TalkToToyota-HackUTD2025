export interface Vehicle {
  id: string;
  name: string;
  price: number;
  msrp: number;
  category: string;
  type: string;
  badges: string[];
  image: string;
  // Extended fields (to be added later)
  specifications?: {
    mpg?: number;
    horsepower?: number;
    seating?: number;
    fuelType?: string;
  };
  features?: string[];
  colors?: string[];
  trimLevels?: string[];
}
