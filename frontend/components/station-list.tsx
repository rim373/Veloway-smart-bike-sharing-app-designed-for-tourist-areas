"use client"

import type { Station } from "@/lib/map-context"
import { useMap } from "@/lib/map-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface StationListProps {
  stations: Station[]
  selectedStation: Station | null
  onSelectStation: (station: Station) => void
}

export default function StationList({ stations, selectedStation, onSelectStation }: StationListProps) {
  const { zoomToStation } = useMap()

  const handleStationClick = (station: Station) => {
    onSelectStation(station)
    zoomToStation(station)
  }

  return (
    <div className="space-y-2 p-4">
      {stations.map((station) => (
        <div
          key={station._id}
          onClick={() => handleStationClick(station)}
          className={`p-4 rounded-lg cursor-pointer transition-all active:scale-95 ${
            selectedStation?._id === station._id
              ? "bg-accent/10 border-2 border-accent shadow-md"
              : "bg-muted border border-border hover:bg-muted/80 active:bg-muted/60"
          }`}
        >
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span className="text-xl">🚩</span>
            {station.name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">{station.address}</p>

          <div className="flex justify-between items-center mt-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="text-accent font-bold">{station.availableBikes}</span> bikes available
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-accent font-bold">{station.freeSlots}</span> free slots
              </p>
            </div>

            {selectedStation?._id === station._id && (
              <Link href={`/ride?stationId=${station._id}`}>
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
