"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import QRScanner from "@/components/qr-scanner"
import Navigation from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/map")
    }
  }, [user, isLoading, router])

  const handleQRScan = (data: string) => {
    const stationId = data.replace("station_", "")
    setShowScanner(false)
    router.push(`/start?stationId=${stationId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 max-w-md mx-auto mt-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">BikeHub</h1>
            <p className="text-muted-foreground text-lg">Rent a bike, ride freely</p>
          </div>

          <Card className="p-6 border border-border bg-card">
            <p className="text-center text-foreground mb-6">Start your journey with a single scan</p>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Sign In</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full border-border hover:bg-muted bg-transparent">
                  Create Account
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-4 border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-3">Quick Access</h3>
            <Button
              onClick={() => setShowScanner(true)}
              variant="outline"
              className="w-full justify-center border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              Scan QR Code
            </Button>
          </Card>
        </div>
      </div>
    </main>
  )
}
