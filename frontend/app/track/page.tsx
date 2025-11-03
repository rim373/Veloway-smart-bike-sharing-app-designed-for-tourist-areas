"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRide } from "@/lib/ride-context"
import { useNotifications } from "@/lib/notifications-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import RideTrackingMap from "@/components/ride-tracking-map"

interface RideStats {
  distance: number
  duration: number
  speed: number
  estimatedCost: number
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateTotalDistance(path: { lat: number; lng: number }[]): number {
  if (path.length < 2) return 0
  let total = 0
  for (let i = 1; i < path.length; i++) {
    total += calculateDistance(path[i - 1].lat, path[i - 1].lng, path[i].lat, path[i].lng)
  }
  return total
}

export default function TrackPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { currentRide, updateGPSPath } = useRide()
  const { addNotification } = useNotifications()
  const [stats, setStats] = useState<RideStats>({
    distance: 0,
    duration: 0,
    speed: 0,
    estimatedCost: 0,
  })
  const [alertSent5Min, setAlertSent5Min] = useState(false)
  const [alertSent1Hour, setAlertSent1Hour] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!currentRide) {
      router.push("/map")
    }
  }, [currentRide, router])

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentRide) {
        const elapsed = (Date.now() - currentRide.startTime) / 1000 / 60 // minutes
        const distance = calculateTotalDistance(currentRide.gpsPath)
        const estimatedCost = (distance * 0.5).toFixed(2)

        setStats({
          distance: Number.parseFloat(distance.toFixed(2)),
          duration: Math.floor(elapsed),
          speed: Number.parseFloat(((distance / Math.max(elapsed, 1)) * 60).toFixed(1)),
          estimatedCost: Number.parseFloat(estimatedCost),
        })

        if (Math.floor(elapsed) === 5 && !alertSent5Min) {
          addNotification({
            type: "bike_alert",
            title: "5 Minutes Elapsed",
            message: `You've been riding for 5 minutes. Distance: ${distance.toFixed(2)}km, Cost: $${estimatedCost}`,
            read: false,
            priority: "medium",
          })
          setAlertSent5Min(true)
        }

        if (Math.floor(elapsed) === 60 && !alertSent1Hour) {
          addNotification({
            type: "bike_alert",
            title: "1 Hour Milestone",
            message: "You've been riding for 1 hour. Remember to return your bike!",
            read: false,
            priority: "high",
          })
          setAlertSent1Hour(true)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentRide, addNotification, alertSent5Min, alertSent1Hour])

  const handleEndRide = () => {
    addNotification({
      type: "ride_update",
      title: "Ride Ending",
      message: "Proceeding to return your bike...",
      read: false,
      priority: "medium",
    })
    router.push(`/return?rideId=${currentRide?.id}`)
  }

  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    updateGPSPath(location)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!currentRide) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="h-screen flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <Card className="w-full h-full border border-border overflow-hidden">
              <RideTrackingMap onLocationUpdate={handleLocationUpdate} />
            </Card>
          </div>

          <div className="md:hidden border-t border-border bg-card p-4">
            <RideStatsDisplay stats={stats} onEndRide={handleEndRide} />
          </div>
        </div>

        <div className="hidden md:flex md:w-80 border-l border-border bg-card flex-col p-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Active Ride</h2>
          <RideStatsDisplay stats={stats} onEndRide={handleEndRide} />
        </div>
      </div>
    </main>
  )
}

function RideStatsDisplay({ stats, onEndRide }: { stats: RideStats; onEndRide: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-medium">Distance</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.distance.toFixed(2)}</p>
          <p className="text-muted-foreground text-xs mt-1">km</p>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-medium">Duration</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.duration}</p>
          <p className="text-muted-foreground text-xs mt-1">min</p>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-medium">Speed</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.speed}</p>
          <p className="text-muted-foreground text-xs mt-1">km/h</p>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <p className="text-muted-foreground text-xs uppercase font-medium">Est. Cost</p>
          <p className="text-2xl font-bold text-accent mt-1">${stats.estimatedCost.toFixed(2)}</p>
        </div>
      </div>

      <Card className="p-3 border border-border">
        <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Ride Details</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <p className="text-muted-foreground">Live tracking active</p>
            <p className="text-accent font-medium">On</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">GPS streaming</p>
            <p className="text-accent font-medium">Active</p>
          </div>
        </div>
      </Card>

      <Button onClick={onEndRide} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
        End Ride & Return Bike
      </Button>
    </div>
  )
}
