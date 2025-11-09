import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vehicle } from "@/types/vehicle";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import ChatInterface from "@/components/chat/ChatInterface";

interface ComparisonViewProps {
  vehicles: Vehicle[];
  onClose: () => void;
  className?: string;
}

export default function ComparisonView({ vehicles, onClose, className }: ComparisonViewProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  // Chat is always visible and takes the remaining space
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="w-full h-full p-4">
        <div className="h-full bg-card border shadow-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Vehicle Comparison</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* vehicle grid - do not stretch to fill; allow chat to take remaining space */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {vehicles.map((v, idx) => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, type: 'spring', stiffness: 120, damping: 14 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => setSelectedVehicle(v)}
                  className="p-4 rounded-lg border bg-background flex items-center justify-between cursor-pointer will-change-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-12 bg-muted/5 rounded overflow-hidden flex items-center justify-center">
                      {v.image ? (
                          <img
                            src={`${import.meta.env.BASE_URL}${v.image.startsWith('/') ? v.image.slice(1) : v.image}`}
                            alt={v.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                               t.onerror = null;
                               t.src = `${import.meta.env.BASE_URL}images/vehicles/image1.png`;
                            }}
                          />
                        ) : (
                          <div className="text-xs text-muted-foreground">No image</div>
                        )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{v.year ?? ""}</div>
                      <div className="font-semibold">{v.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Starting at</div>
                    <div className="font-medium">{currencyFormatter.format(v.price)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            
          </div>

            {/* details panel - slides down from above and pushes the chat down */}
            <AnimatePresence>
              {selectedVehicle && (
                <motion.div
                  key={selectedVehicle.id}
                  layout
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                  className="overflow-hidden px-4"
                >
                  <motion.div
                    layout
                    className="rounded-lg border bg-background p-4 shadow-md max-h-[60vh] overflow-auto"
                    transition={{ type: 'spring', stiffness: 160, damping: 22 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div layout className="w-40 h-28 rounded overflow-hidden bg-muted/5 flex-shrink-0">
                          {selectedVehicle.image ? (
                            <motion.img
                              layout
                              src={`${import.meta.env.BASE_URL}${selectedVehicle.image.startsWith('/') ? selectedVehicle.image.slice(1) : selectedVehicle.image}`}
                              alt={selectedVehicle.name}
                              className="w-full h-full object-cover"
                              initial={{ scale: 0.98, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.98, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                              onError={(e) => {
                                const t = e.target as HTMLImageElement;
                                t.onerror = null;
                                t.src = `${import.meta.env.BASE_URL}images/vehicles/image1.png`;
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No image</div>
                          )}
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-semibold">{selectedVehicle.name}</h3>
                          <p className="text-sm text-muted-foreground">{currencyFormatter.format(selectedVehicle.price)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={() => setSelectedVehicle(null)}>
                        Close
                      </Button>
                    </div>

                    {/* Fixed-height scroll area so details always show a scrollbar similar to the chat */}
                    <ScrollArea className="mt-4 h-[36vh] md:h-[50vh] overflow-auto">
                      <div className="space-y-4">
                        {selectedVehicle.specifications?.mpg && (
                          <div>
                            <h4 className="font-medium">Fuel Economy</h4>
                            <p>City: {selectedVehicle.specifications.mpg.city ?? "—"} MPG</p>
                            <p>Highway: {selectedVehicle.specifications.mpg.highway ?? "—"} MPG</p>
                          </div>
                        )}

                        {selectedVehicle.features && (
                          <div>
                            <h4 className="font-medium">Features</h4>
                            <ul className="list-disc pl-4">
                              {selectedVehicle.features.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          {/* Chat panel (always visible) — take remaining height so it's prominent */}
          <motion.div
            key="comparison-chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 22 }}
            className="border-t bg-card flex-1 min-h-[36vh] flex flex-col overflow-auto"
          >
            <div className={`p-4 flex-1 overflow-hidden`}>
              {/* ChatInterface renders its own header; no duplicate title or expand controls here */}
              <div className="h-full">
                <ChatInterface
                  vehicles={vehicles}
                  selectedVehicles={vehicles}
                  isComparison={true}
                  className="h-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}