"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRideHistory, type CompletedRide } from "@/lib/ride-history-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RideDetailsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { getRideById } = useRideHistory()
  const router = useRouter()
  const params = useParams()
  const rideId = params.id as string

  const [ride, setRide] = useState<CompletedRide | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const foundRide = getRideById(rideId)
    if (foundRide) {
      setRide(foundRide)
    } else {
      router.push("/profile")
    }
  }, [rideId, getRideById, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!ride) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/profile">
              <Button variant="outline" className="border-border bg-transparent mb-4">
                ← Back to Profile
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Ride Details</h1>
          </div>

          {/* Route Card */}
          <Card className="p-6 border border-border bg-card mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Route</h2>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">From</p>
                <p className="text-foreground font-semibold text-lg">{ride.startStationName}</p>
              </div>
              <div className="text-center py-2">
                <div className="border-l-2 border-accent h-8 mx-auto"></div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">To</p>
                <p className="text-foreground font-semibold text-lg">{ride.endStationName}</p>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 border border-border bg-card">
              <p className="text-muted-foreground text-xs uppercase font-medium">Distance</p>
              <p className="text-2xl font-bold text-foreground mt-2">{ride.distance.toFixed(2)}</p>
              <p className="text-muted-foreground text-xs mt-1">km</p>
            </Card>
            <Card className="p-4 border border-border bg-card">
              <p className="text-muted-foreground text-xs uppercase font-medium">Duration</p>
              <p className="text-2xl font-bold text-foreground mt-2">{ride.duration}</p>
              <p className="text-muted-foreground text-xs mt-1">minutes</p>
            </Card>
            <Card className="p-4 border border-border bg-card">
              <p className="text-muted-foreground text-xs uppercase font-medium">Speed</p>
              <p className="text-2xl font-bold text-foreground mt-2">{ride.speed.toFixed(1)}</p>
              <p className="text-muted-foreground text-xs mt-1">km/h</p>
            </Card>
            <Card className="p-4 border border-border bg-card">
              <p className="text-muted-foreground text-xs uppercase font-medium">Cost</p>
              <p className="text-2xl font-bold text-accent mt-2">${ride.estimatedCost.toFixed(2)}</p>
            </Card>
          </div>

          {/* Trip Info */}
          <Card className="p-6 border border-border bg-card mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Trip Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Plan Selected</p>
                <p className="text-foreground font-medium">{ride.offerName}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Bike ID</p>
                <p className="text-foreground font-mono text-sm">{ride.bikeId}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Ride ID</p>
                <p className="text-foreground font-mono text-sm">{ride.id.slice(-8)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Start Time</p>
                <p className="text-foreground font-medium">{new Date(ride.startTime).toLocaleString()}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">End Time</p>
                <p className="text-foreground font-medium">{new Date(ride.endTime).toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* Bike Condition */}
          <Card className="p-6 border border-border bg-card mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Bike Condition Report</h2>
            <div
              className={`p-4 rounded-lg mb-4 ${
                ride.bikeCondition === "good" ? "bg-green-500/10" : "bg-yellow-500/10"
              }`}
            >
              <p className={`font-medium ${ride.bikeCondition === "good" ? "text-green-700" : "text-yellow-700"}`}>
                Status: {ride.bikeCondition === "good" ? "Good Condition" : "Minor Issues"}
              </p>
            </div>
            {ride.defects.length > 0 ? (
              <div>
                <p className="text-muted-foreground text-sm mb-2">Reported Issues:</p>
                <ul className="space-y-1">
                  {ride.defects.map((defect, i) => (
                    <li key={i} className="text-foreground text-sm">
                      • {defect}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No issues reported</p>
            )}
          </Card>

          {/* Actions */}
          <Link href="/profile" className="block">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Back to Profile</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
