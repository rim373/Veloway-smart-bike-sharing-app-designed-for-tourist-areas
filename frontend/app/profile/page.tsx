"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRideHistory } from "@/lib/ride-history-context"
import { usePayment } from "@/lib/payment-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const { rides, getTotalStats } = useRideHistory()
  const { wallet } = usePayment()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalRides: 0,
    totalDistance: 0,
    totalDuration: 0,
    totalSpent: 0,
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    setStats(getTotalStats())
  }, [rides, getTotalStats])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and view your riding history</p>
          </div>

          {/* Wallet Balance Card */}
          {wallet && (
            <Card className="p-6 border border-accent bg-accent/5 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Wallet Balance</p>
                  <p className="text-3xl font-bold text-foreground">${wallet.balance.toFixed(2)}</p>
                </div>
                <Link href="/billing">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Manage Billing</Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Ride History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* User Info Card */}
              <Card className="p-6 border border-border bg-card">
                <h2 className="text-lg font-bold text-foreground mb-4">Account Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Name</p>
                    <p className="text-foreground font-medium">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Email</p>
                    <p className="text-foreground font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">User ID</p>
                    <p className="text-foreground font-mono text-sm">{user.id}</p>
                  </div>
                </div>
              </Card>

              {/* Stats Cards */}
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Your Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 border border-border bg-card">
                    <p className="text-muted-foreground text-xs uppercase font-medium">Total Rides</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{stats.totalRides}</p>
                  </Card>
                  <Card className="p-4 border border-border bg-card">
                    <p className="text-muted-foreground text-xs uppercase font-medium">Total Distance</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{stats.totalDistance.toFixed(1)}</p>
                    <p className="text-muted-foreground text-xs mt-1">km</p>
                  </Card>
                  <Card className="p-4 border border-border bg-card">
                    <p className="text-muted-foreground text-xs uppercase font-medium">Total Time</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{stats.totalDuration}</p>
                    <p className="text-muted-foreground text-xs mt-1">min</p>
                  </Card>
                  <Card className="p-4 border border-border bg-card">
                    <p className="text-muted-foreground text-xs uppercase font-medium">Total Spent</p>
                    <p className="text-2xl font-bold text-accent mt-2">${stats.totalSpent.toFixed(2)}</p>
                  </Card>
                </div>
              </div>

              {/* Actions */}
              <Card className="p-6 border border-border bg-card">
                <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/map" className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground justify-start">
                      Start a New Ride
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent justify-start"
                    onClick={() => {
                      logout()
                      router.push("/")
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              {rides.length === 0 ? (
                <Card className="p-12 border border-border bg-card text-center">
                  <p className="text-muted-foreground mb-4">No rides yet</p>
                  <Link href="/map">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Start Your First Ride
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="space-y-3">
                  {rides.map((ride) => (
                    <Link key={ride.id} href={`/ride-details/${ride.id}`} className="block">
                      <Card className="p-4 border border-border hover:border-accent transition-all cursor-pointer hover:bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-foreground font-semibold">
                              {ride.startStationName} → {ride.endStationName}
                            </p>
                            <p className="text-muted-foreground text-sm mt-1">
                              {new Date(ride.startTime).toLocaleDateString()} at{" "}
                              {new Date(ride.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-foreground font-bold">${ride.estimatedCost.toFixed(2)}</p>
                            <p className="text-muted-foreground text-sm">{ride.distance.toFixed(1)} km</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-muted-foreground text-xs">Duration</p>
                            <p className="text-foreground font-medium">{ride.duration} min</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Speed</p>
                            <p className="text-foreground font-medium">{ride.speed.toFixed(1)} km/h</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Plan</p>
                            <p className="text-foreground font-medium text-sm">{ride.offerName}</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
