"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useMap } from "@/lib/map-context"
import { useRide } from "@/lib/ride-context"
import { useRideHistory } from "@/lib/ride-history-context"
import { useNotifications } from "@/lib/notifications-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function CompletionPageContent() {
  const { user, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const stationId = searchParams.get("stationId")
  const { stations } = useMap()
  const { currentRide } = useRide()
  const { addRide } = useRideHistory()
  const { addNotification } = useNotifications()
  const [station, setStation] = useState<any>(null)
  const [rideStats] = useState({
    distance: 2.8,
    duration: 9,
    speed: 18.7,
    estimatedCost: 1.4,
  })

  useEffect(() => {
    if (stationId && stations.length > 0) {
      const found = stations.find((s) => s.id === stationId)
      setStation(found)

      if (currentRide && found && user) {
        const startStation = stations.find((s) => s.id === currentRide.stationId)
        const completedRide = {
          id: currentRide.id,
          userId: user.id,
          bikeId: currentRide.bikeId || "unknown",
          startStationId: currentRide.stationId,
          endStationId: found.id,
          startStationName: startStation?.name || "Unknown",
          endStationName: found.name,
          startTime: currentRide.startTime,
          endTime: Date.now(),
          distance: rideStats.distance,
          duration: rideStats.duration,
          speed: rideStats.speed,
          estimatedCost: rideStats.estimatedCost,
          offerId: currentRide.offerId,
          offerName: "Completed Ride",
          bikeCondition: "good",
          defects: [],
        }
        addRide(completedRide)

        addNotification({
          type: "ride_update",
          title: "Ride Completed",
          message: `Great ride! You traveled ${rideStats.distance}km and were charged $${rideStats.estimatedCost}`,
          read: false,
          priority: "high",
        })
      }
    }
  }, [stationId, stations, currentRide, user, addRide, addNotification])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Ride Complete!</h1>
          <p className="text-muted-foreground mb-8">Your bike has been successfully returned</p>

          {/* Station Info */}
          {station && (
            <Card className="p-6 border border-border bg-card mb-8">
              <p className="text-muted-foreground text-sm mb-2">Returned at</p>
              <h3 className="font-bold text-foreground text-lg">{station.name}</h3>
              <p className="text-muted-foreground text-sm mt-2">{station.address}</p>
            </Card>
          )}

          {/* Next Steps */}
          <div className="space-y-3">
            <Link href="/map" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Rent Another Bike
              </Button>
            </Link>
            <Link href="/profile" className="block">
              <Button variant="outline" className="w-full border-border bg-transparent">
                View Trip History
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CompletionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <CompletionPageContent />
    </Suspense>
  )
}
