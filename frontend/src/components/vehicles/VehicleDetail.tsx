import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vehicle } from "@/types/vehicle";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface VehicleDetailProps {
  vehicle: Vehicle;
  onClose: () => void;
  onAddToCart?: () => void;
}

export default function VehicleDetail({
  vehicle,
  onClose,
  onAddToCart,
}: VehicleDetailProps) {
  const specs = vehicle.specifications;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -400, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen w-full lg:w-[450px] bg-card border-r border-border shadow-2xl z-50 overflow-y-auto"
      >
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10 shadow-sm">
          <h2 className="text-xl font-bold text-card-foreground">Vehicle Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <motion.img
              layoutId={`vehicle-image-${vehicle.id}`}
              src={vehicle.image.startsWith('/') ? `${import.meta.env.BASE_URL}${vehicle.image.slice(1)}` : vehicle.image}
              alt={vehicle.name}
              className="w-full h-full object-contain"
            />
            {vehicle.badges.length > 0 && (
              <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                {vehicle.badges.map((badge, idx) => (
                  <Badge
                    key={idx}
                    className="bg-accent text-accent-foreground font-medium"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              <motion.span layoutId={`vehicle-title-${vehicle.id}`}>{vehicle.name}</motion.span>
            </h1>
            {vehicle.year && (
              <p className="text-muted-foreground mb-4">{vehicle.year}</p>
            )}
            <div className="space-y-2">
              <p className="text-4xl font-bold text-card-foreground">
                <motion.span layoutId={`vehicle-price-${vehicle.id}`}>${vehicle.price.toLocaleString()}</motion.span>
              </p>
              {vehicle.priceRange && (
                <p className="text-sm text-muted-foreground">
                  {vehicle.priceRange}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Starting MSRP*
              </p>
            </div>
          </div>

          <Separator />

          {/* Key Specifications */}
          {specs && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {specs.mpg && (
                  <div className="grid grid-cols-3 gap-4">
                    {specs.mpg.city && (
                      <div>
                        <p className="text-sm text-muted-foreground">City MPG</p>
                        <p className="text-lg font-semibold">{specs.mpg.city}</p>
                      </div>
                    )}
                    {specs.mpg.highway && (
                      <div>
                        <p className="text-sm text-muted-foreground">Highway MPG</p>
                        <p className="text-lg font-semibold">{specs.mpg.highway}</p>
                      </div>
                    )}
                    {specs.mpg.combined && (
                      <div>
                        <p className="text-sm text-muted-foreground">Combined MPG</p>
                        <p className="text-lg font-semibold">{specs.mpg.combined}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {specs.horsepower && (
                    <div>
                      <p className="text-sm text-muted-foreground">Horsepower</p>
                      <p className="text-lg font-semibold">{specs.horsepower} hp</p>
                    </div>
                  )}
                  {specs.torque && (
                    <div>
                      <p className="text-sm text-muted-foreground">Torque</p>
                      <p className="text-lg font-semibold">{specs.torque}</p>
                    </div>
                  )}
                  {specs.seating && (
                    <div>
                      <p className="text-sm text-muted-foreground">Seating</p>
                      <p className="text-lg font-semibold">{specs.seating} passengers</p>
                    </div>
                  )}
                  {specs.fuelType && (
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Type</p>
                      <p className="text-lg font-semibold">{specs.fuelType}</p>
                    </div>
                  )}
                </div>

                {specs.engine && (
                  <div>
                    <p className="text-sm text-muted-foreground">Engine</p>
                    <p className="text-lg font-semibold">{specs.engine}</p>
                  </div>
                )}

                {specs.transmission && (
                  <div>
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p className="text-lg font-semibold">{specs.transmission}</p>
                  </div>
                )}

                {specs.drivetrain && (
                  <div>
                    <p className="text-sm text-muted-foreground">Drivetrain</p>
                    <p className="text-lg font-semibold">{specs.drivetrain}</p>
                  </div>
                )}

                {specs.cargoSpace && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cargo Space</p>
                    <p className="text-lg font-semibold">{specs.cargoSpace}</p>
                  </div>
                )}

                {specs.electricRange && (
                  <div>
                    <p className="text-sm text-muted-foreground">Electric Range</p>
                    <p className="text-lg font-semibold">{specs.electricRange}</p>
                  </div>
                )}

                {specs.dimensions && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-semibold mb-2">Dimensions</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {specs.dimensions.length && (
                        <div>
                          <span className="text-muted-foreground">Length: </span>
                          <span>{specs.dimensions.length}</span>
                        </div>
                      )}
                      {specs.dimensions.width && (
                        <div>
                          <span className="text-muted-foreground">Width: </span>
                          <span>{specs.dimensions.width}</span>
                        </div>
                      )}
                      {specs.dimensions.height && (
                        <div>
                          <span className="text-muted-foreground">Height: </span>
                          <span>{specs.dimensions.height}</span>
                        </div>
                      )}
                      {specs.dimensions.weight && (
                        <div>
                          <span className="text-muted-foreground">Weight: </span>
                          <span>{specs.dimensions.weight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {vehicle.features && vehicle.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {vehicle.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Best For */}
          {vehicle.bestFor && vehicle.bestFor.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best For</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {vehicle.bestFor.map((use, idx) => (
                    <Badge key={idx} variant="secondary">
                      {use}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warranty */}
          {vehicle.warranty && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Warranty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{vehicle.warranty}</p>
              </CardContent>
            </Card>
          )}

          {/* Pros */}
          {vehicle.pros && vehicle.pros.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Pros</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {vehicle.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Add to Cart Button */}
          <div className="sticky bottom-0 bg-card pt-4 pb-2 border-t border-border">
            <Button
              onClick={onAddToCart}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              Add to Cart - ${vehicle.price.toLocaleString()}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              *Pricing and availability may vary
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

