import { useState, useEffect } from "react";
import { collection, getDocs, query, where, QueryConstraint } from "firebase/firestore";
import { db } from "@/services/firebase";
import { Vehicle } from "@/types/vehicle";
import vehiclesData from "@/data/vehicles.json";

export function useVehicles(category?: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        
        // If Firebase is not configured, use JSON fallback
        if (!db) {
          console.log("Using JSON fallback data");
          let data = vehiclesData as Vehicle[];
          if (category) {
            data = data.filter((v) => v.category === category);
          }
          setVehicles(data);
          setLoading(false);
          return;
        }
        
        const vehiclesRef = collection(db, "vehicles");
        const constraints: QueryConstraint[] = [];
        if (category) {
          constraints.push(where("category", "==", category));
        }
        
        const q = query(vehiclesRef, ...constraints);
        const querySnapshot = await getDocs(q);
        
        const firebaseVehicles: Vehicle[] = [];
        querySnapshot.forEach((doc) => {
          firebaseVehicles.push({ id: doc.id, ...doc.data() } as Vehicle);
        });
        
        // Fallback to JSON if no data from Firebase
        if (firebaseVehicles.length === 0) {
          console.log("No Firebase data, using JSON fallback");
          let data = vehiclesData as Vehicle[];
          if (category) {
            data = data.filter((v) => v.category === category);
          }
          setVehicles(data);
        } else {
          setVehicles(firebaseVehicles);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        // Fallback to JSON on error
        console.log("Falling back to JSON data");
        let data = vehiclesData as Vehicle[];
        if (category) {
          data = data.filter((v) => v.category === category);
        }
        setVehicles(data);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [category]);

  return { vehicles, loading, error };
}