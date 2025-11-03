"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRide } from "@/lib/ride-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import OffersSelection from "@/components/offers-selection"

function RidePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()
  const { currentRide, selectedOffer, startRide } = useRide()
  const stationId = searchParams.get("stationId")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // If ride already started, show ride tracking
  if (currentRide) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto p-6 border border-border bg-card">
            <h2 className="text-xl font-bold text-foreground mb-4">Ride In Progress</h2>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded">
                <p className="text-muted-foreground text-sm">Ride ID</p>
                <p className="text-foreground font-mono text-sm">{currentRide.id}</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-muted-foreground text-sm">Bike</p>
                <p className="text-foreground font-mono text-sm">{currentRide.bikeId}</p>
              </div>
            </div>
            <Link href="/track" className="block mt-6">
              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Track Ride</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return <OffersSelection stationId={stationId || ""} />
}

export default function RidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <RidePageContent />
    </Suspense>
  )
}
