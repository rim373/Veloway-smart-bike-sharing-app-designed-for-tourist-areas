"use client"

import type { Station } from "@/lib/map-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ReturnStationSelectorProps {
  stations: Station[]
  onSelectStation: (station: Station) => void
}

export default function ReturnStationSelector({ stations, onSelectStation }: ReturnStationSelectorProps) {
  return (
    <div className="space-y-3">
      {stations.map((station) => (
        <Card
          key={station.id}
          onClick={() => onSelectStation(station)}
          className="p-4 cursor-pointer border border-border hover:border-accent transition-all hover:bg-muted/50"
        >
          <h3 className="font-semibold text-foreground">{station.name}</h3>
          <p className="text-muted-foreground text-sm mt-1">{station.address}</p>

          <div className="flex justify-between items-center mt-3">
            <div className="text-xs">
              <p className="text-accent font-semibold">{station.freeSlots} free slots</p>
            </div>
            <Button size="sm" variant="outline" className="border-accent text-accent bg-transparent">
              Select
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
