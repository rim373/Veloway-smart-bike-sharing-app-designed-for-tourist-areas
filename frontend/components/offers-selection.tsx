"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRide } from "@/lib/ride-context"
import { useNotifications } from "@/lib/notifications-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OffersSelectionProps {
  stationId: string
}

export default function OffersSelection({ stationId }: OffersSelectionProps) {
  const router = useRouter()
  const { offers, selectedOffer, setSelectedOffer, startRide } = useRide()
  const { addNotification } = useNotifications()
  const [isConfirming, setIsConfirming] = useState(false)

  const handleSelectOffer = (offerId: string) => {
    const offer = offers.find((o) => o.id === offerId)
    if (offer) {
      setSelectedOffer(offer)
      addNotification({
        type: "ride_update",
        title: "Offer Selected",
        message: `You selected ${offer.name} for $${offer.price}`,
        read: false,
        priority: "low",
      })
    }
  }

  const handleConfirmOffer = () => {
    if (selectedOffer) {
      setIsConfirming(true)

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const startLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }

            addNotification({
              type: "ride_update",
              title: "Ride Starting",
              message: `Your ${selectedOffer.name} ride is beginning. Lock your bike when done!`,
              read: false,
              priority: "high",
            })

            setTimeout(() => {
              startRide(stationId, selectedOffer.id, startLocation)
              router.push("/track")
            }, 600)
          },
          (error) => {
            console.error("Geolocation error:", error)
            // Fallback: start ride without location
            addNotification({
              type: "bike_alert",
              title: "GPS Not Available",
              message: "Starting ride without location. GPS will be used for tracking.",
              read: false,
              priority: "medium",
            })

            setTimeout(() => {
              startRide(stationId, selectedOffer.id)
              router.push("/track")
            }, 600)
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          },
        )
      } else {
        // Geolocation not available
        addNotification({
          type: "bike_alert",
          title: "Location Services Not Supported",
          message: "Your device doesn't support location services.",
          read: false,
          priority: "high",
        })
        setIsConfirming(false)
      }
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground">Select a pricing option to start your ride</p>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {offers.map((offer) => (
              <Card
                key={offer.id}
                onClick={() => handleSelectOffer(offer.id)}
                className={`p-6 cursor-pointer transition-all border-2 ${
                  selectedOffer?.id === offer.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-2xl">{offer.icon}</p>
                    <h3 className="font-bold text-foreground mt-2">{offer.name}</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">${offer.price}</p>
                </div>

                <p className="text-muted-foreground text-sm mb-4">{offer.description}</p>

                {/* Offer Details */}
                <div className="text-xs text-muted-foreground space-y-1">
                  {offer.duration && <p>Duration: {offer.duration} minutes</p>}
                  {offer.distance && <p>Per {offer.distance} km</p>}
                  {offer.type === "time" && offer.duration === 1440 && (
                    <p className="text-accent font-medium">Best value</p>
                  )}
                </div>

                {/* Selection Indicator */}
                {selectedOffer?.id === offer.id && (
                  <div className="mt-4 pt-4 border-t border-accent/20">
                    <p className="text-accent text-xs font-semibold uppercase">Selected</p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Summary */}
          {selectedOffer && (
            <Card className="p-6 border border-accent bg-accent/5 mb-6">
              <h3 className="font-semibold text-foreground mb-3">Ride Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Plan</p>
                  <p className="text-foreground font-medium">{selectedOffer.name}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-muted-foreground">Price</p>
                  <p className="text-foreground font-medium">${selectedOffer.price}</p>
                </div>
                {selectedOffer.duration && (
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Duration</p>
                    <p className="text-foreground font-medium">{selectedOffer.duration} min</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link href="/map" className="flex-1">
              <Button variant="outline" className="w-full border-border bg-transparent">
                Back to Map
              </Button>
            </Link>
            <Button
              onClick={handleConfirmOffer}
              disabled={!selectedOffer || isConfirming}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
            >
              {isConfirming ? "Starting ride..." : "Start Ride"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
