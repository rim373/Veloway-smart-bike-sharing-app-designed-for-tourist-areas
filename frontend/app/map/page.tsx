"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useMap } from "@/lib/map-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import MapView from "@/components/map-view"
import StationList from "@/components/station-list"
import Link from "next/link"

export default function MapPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { stations, selectedStation, setSelectedStation, fetchStations, isLoading } = useMap()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    fetchStations()
  }, [])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-screen flex flex-col md:flex-row">
        {/* Map Section */}
        <div className="flex-1 flex flex-col md:min-h-full">
          <div className="h-1/2 md:h-full p-2 md:p-4">
            <Card className="w-full h-full border border-border overflow-hidden">
              <MapView />
            </Card>
          </div>

          {/* Mobile Bottom Sheet with Station Details */}
          <div className="md:hidden h-1/2 border-t border-border bg-card flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {selectedStation ? (
                <StationDetails station={selectedStation} />
              ) : (
                <div className="h-full flex items-center justify-center p-4">
                  <p className="text-muted-foreground text-center">Tap a station on the map to see details and rent</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-80 border-l border-border bg-card flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Bike Stations</h2>
            <p className="text-muted-foreground text-sm mt-1">{stations.length} stations available</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <StationList stations={stations} selectedStation={selectedStation} onSelectStation={setSelectedStation} />
          </div>
        </div>
      </div>
    </main>
  )
}

function StationDetails({ station }: { station: any }) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-bold text-xl text-foreground">{station.name}</h3>
        <p className="text-muted-foreground text-sm mt-1">{station.address}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-muted rounded-lg border border-border">
          <p className="text-muted-foreground text-xs uppercase font-medium">Available Bikes</p>
          <p className="text-3xl font-bold text-primary mt-2">{station.availableBikes}</p>
        </div>
        <div className="p-4 bg-muted rounded-lg border border-border">
          <p className="text-muted-foreground text-xs uppercase font-medium">Free Slots</p>
          <p className="text-3xl font-bold text-accent mt-2">{station.freeSlots}</p>
        </div>
      </div>

      <Link href={`/ride?stationId=${station.id}`} className="block w-full">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-semibold">
          Rent a Bike from {station.name}
        </Button>
      </Link>
    </div>
  )
}
