"use client"

import { useEffect, useState } from "react"
import { useBikes } from "@/lib/bike-context"
import type { Bike } from "@/lib/types/bike"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface BikeListProps {
  stationId?: string
  onSelectBike?: (bike: Bike) => void
}

export default function BikeList({ stationId, onSelectBike }: BikeListProps) {
  const { fetchBikesByStation, fetchAvailableBikesByStation, loading } = useBikes()
  const [bikes, setBikes] = useState<Bike[]>([])

  useEffect(() => {
    const loadBikes = async () => {
      if (stationId) {
        const stationBikes = await fetchAvailableBikesByStation(stationId)
        setBikes(stationBikes)
      }
    }
    loadBikes()
  }, [stationId, fetchAvailableBikesByStation])

  const getBatteryColor = (level: number) => {
    if (level >= 70) return "bg-green-500"
    if (level >= 30) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      available: { variant: "default", label: "Available" },
      in_use: { variant: "secondary", label: "In Use" },
      maintenance: { variant: "destructive", label: "Maintenance" },
      unavailable: { variant: "outline", label: "Unavailable" },
    }
    const statusInfo = statusMap[status.toLowerCase()] || { variant: "outline", label: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (bikes.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No bikes available at this station</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {bikes.map((bike) => (
        <Card
          key={bike.bikeId}
          className="p-4 hover:shadow-md transition-all border border-border"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-foreground">
                  {bike.brand} {bike.model}
                </h4>
                {getStatusBadge(bike.status)}
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                Serial: {bike.serialNumber}
              </p>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Battery:</span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBatteryColor(bike.batteryLevel)} transition-all`}
                      style={{ width: `${bike.batteryLevel}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">{bike.batteryLevel}%</span>
                </div>
              </div>
            </div>

            {onSelectBike && bike.status.toLowerCase() === 'available' && (
              <Button
                size="sm"
                onClick={() => onSelectBike(bike)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Select
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
