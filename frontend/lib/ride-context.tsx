"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface Offer {
  id: string
  type: "time" | "distance"
  name: string
  description: string
  price: number
  duration?: number // in minutes for time-based
  distance?: number // in km for distance-based
  icon: string
}

export interface RideSession {
  id: string
  stationId: string
  offerId: string
  startTime: number
  bikeId?: string
  startLocation?: { lat: number; lng: number }
  gpsPath: { lat: number; lng: number }[]
  photoRequired: boolean
  photoCaptured: boolean
}

interface RideContextType {
  currentRide: RideSession | null
  selectedOffer: Offer | null
  offers: Offer[]
  startRide: (stationId: string, offerId: string, startLocation?: { lat: number; lng: number }) => void
  endRide: () => void
  setSelectedOffer: (offer: Offer) => void
  updateGPSPath: (location: { lat: number; lng: number }) => void
  setPhotoCaptured: (captured: boolean) => void
}

const RideContext = createContext<RideContextType | undefined>(undefined)

const DEFAULT_OFFERS: Offer[] = [
  {
    id: "1",
    type: "time",
    name: "30 Min Ride",
    description: "Perfect for short trips",
    price: 2.99,
    duration: 30,
    icon: "⏱️",
  },
  {
    id: "2",
    type: "time",
    name: "1 Hour Ride",
    description: "Great for exploring",
    price: 5.99,
    duration: 60,
    icon: "⏱️",
  },
  {
    id: "3",
    type: "distance",
    name: "Distance Pass",
    description: "Pay per kilometer",
    price: 0.5,
    distance: 1,
    icon: "📍",
  },
  {
    id: "4",
    type: "time",
    name: "Unlimited Day Pass",
    description: "Unlimited rides for 24h",
    price: 19.99,
    duration: 1440,
    icon: "🌅",
  },
]

export function RideProvider({ children }: { children: React.ReactNode }) {
  const [currentRide, setCurrentRide] = useState<RideSession | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [offers] = useState(DEFAULT_OFFERS)

  const startRide = (stationId: string, offerId: string, startLocation?: { lat: number; lng: number }) => {
    const ride: RideSession = {
      id: `ride_${Date.now()}`,
      stationId,
      offerId,
      startTime: Date.now(),
      bikeId: `bike_${Math.random().toString(36).substr(2, 9)}`,
      startLocation,
      gpsPath: startLocation ? [startLocation] : [],
      photoRequired: true,
      photoCaptured: false,
    }
    setCurrentRide(ride)
  }

  const endRide = () => {
    setCurrentRide(null)
    setSelectedOffer(null)
  }

  const updateGPSPath = (location: { lat: number; lng: number }) => {
    setCurrentRide((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        gpsPath: [...prev.gpsPath, location],
      }
    })
  }

  const setPhotoCaptured = (captured: boolean) => {
    setCurrentRide((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        photoCaptured: captured,
      }
    })
  }

  return (
    <RideContext.Provider
      value={{
        currentRide,
        selectedOffer,
        offers,
        startRide,
        endRide,
        setSelectedOffer,
        updateGPSPath,
        setPhotoCaptured,
      }}
    >
      {children}
    </RideContext.Provider>
  )
}

export function useRide() {
  const context = useContext(RideContext)
  if (context === undefined) {
    throw new Error("useRide must be used within a RideProvider")
  }
  return context
}
