"use client"

import type { Station } from "@/lib/map-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface StationListProps {
  stations: Station[]
  selectedStation: Station | null
  onSelectStation: (station: Station) => void
}

export default function StationList({ stations, selectedStation, onSelectStation }: StationListProps) {
  return (
    <div className="space-y-2 p-4">
      {stations.map((station) => (
        <div
          key={station.id}
          onClick={() => onSelectStation(station)}
          className={`p-3 rounded-lg cursor-pointer transition-all ${
            selectedStation?.id === station.id
              ? "bg-accent/10 border-2 border-accent"
              : "bg-muted border border-border hover:bg-muted/80"
          }`}
        >
          <h3 className="font-semibold text-foreground text-sm">{station.name}</h3>
          <p className="text-muted-foreground text-xs mt-1">{station.address}</p>

          <div className="flex justify-between items-center mt-3">
            <div className="text-xs">
              <p className="text-muted-foreground">
                <span className="text-accent font-semibold">{station.availableBikes}</span> bikes
              </p>
              <p className="text-muted-foreground">
                <span className="text-accent font-semibold">{station.freeSlots}</span> slots
              </p>
            </div>

            {selectedStation?.id === station.id && (
              <Link href={`/ride?stationId=${station.id}`}>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Rent
                </Button>
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
