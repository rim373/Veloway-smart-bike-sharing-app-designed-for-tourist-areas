"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMap } from "@/lib/map-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StationList from "@/components/station-list";
import Link from "next/link";
import dynamic from "next/dynamic";

// 🔹 Import dynamique pour éviter "window is not defined"
const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
});

export default function MapPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { stations, selectedStation, setSelectedStation, fetchStations, isLoading } = useMap();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchStations();
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="h-screen flex flex-col md:flex-row">
        {/* Map Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <Card className="w-full h-full border border-border overflow-hidden">
              <MapView />
            </Card>
          </div>

          {/* Mobile Bottom Sheet */}
          <div className="md:hidden border-t border-border bg-card p-4">
            {selectedStation ? (
              <StationDetails station={selectedStation} />
            ) : (
              <p className="text-muted-foreground text-center text-sm">
                Tap a station on the map to see details
              </p>
            )}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-80 border-l border-border bg-card flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Bike Stations</h2>
            <p className="text-muted-foreground text-sm mt-1">{stations.length} stations available</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <StationList
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={setSelectedStation}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// 🔹 Composant de détails station mobile
function StationDetails({ station }: { station: any }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-lg text-foreground">{station.name}</h3>
        <p className="text-muted-foreground text-sm">{station.address}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-medium">Bikes</p>
          <p className="text-2xl font-bold text-foreground mt-1">{station.availableBikes}</p>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-medium">Slots</p>
          <p className="text-2xl font-bold text-foreground mt-1">{station.freeSlots}</p>
        </div>
      </div>

      <Link href={`/ride?stationId=${station.id}`} className="block">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          Rent a Bike
        </Button>
      </Link>
    </div>
  );
}
