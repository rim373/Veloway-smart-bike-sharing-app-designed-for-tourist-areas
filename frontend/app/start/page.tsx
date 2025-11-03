"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function StationDetailsContent() {
  const searchParams = useSearchParams()
  const stationId = searchParams.get("stationId")
  const [station, setStation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching station data from Jakarta backend
    setTimeout(() => {
      setStation({
        id: stationId,
        name: `Station ${stationId}`,
        availableBikes: 8,
        freeSlots: 5,
        address: "123 Main Street, Downtown",
        location: { lat: 40.7128, lng: -74.006 },
      })
      setLoading(false)
    }, 500)
  }, [stationId])

  if (!stationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-6 max-w-sm">
          <p className="text-foreground mb-4">No station selected</p>
          <Link href="/">
            <Button className="w-full bg-primary hover:bg-primary/90">Back to Home</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 border border-border bg-card">
          <h2 className="text-2xl font-bold text-foreground mb-2">{station.name}</h2>
          <p className="text-muted-foreground mb-6">{station.address}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground text-sm">Available Bikes</p>
              <p className="text-2xl font-bold text-foreground">{station.availableBikes}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground text-sm">Free Slots</p>
              <p className="text-2xl font-bold text-foreground">{station.freeSlots}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href="/login" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Rent Now</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full border-border bg-transparent">
                Back
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function StartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <StationDetailsContent />
    </Suspense>
  )
}
