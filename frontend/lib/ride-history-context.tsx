"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface CompletedRide {
  id: string
  userId: string
  bikeId: string
  startStationId: string
  endStationId: string
  startStationName: string
  endStationName: string
  startTime: number
  endTime: number
  distance: number
  duration: number
  speed: number
  estimatedCost: number
  offerId: string
  offerName: string
  photoUrl?: string
  bikeCondition: string
  defects: string[]
}

interface RideHistoryContextType {
  rides: CompletedRide[]
  isLoading: boolean
  addRide: (ride: CompletedRide) => void
  getRideById: (id: string) => CompletedRide | undefined
  getTotalStats: () => {
    totalRides: number
    totalDistance: number
    totalDuration: number
    totalSpent: number
  }
}

const RideHistoryContext = createContext<RideHistoryContextType | undefined>(undefined)

export function RideHistoryProvider({ children }: { children: React.ReactNode }) {
  const [rides, setRides] = useState<CompletedRide[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load ride history from localStorage
  useEffect(() => {
    const savedRides = localStorage.getItem("ride_history")
    if (savedRides) {
      try {
        setRides(JSON.parse(savedRides))
      } catch (error) {
        console.error("Failed to load ride history:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const addRide = (ride: CompletedRide) => {
    setRides((prev) => {
      const updated = [ride, ...prev]
      localStorage.setItem("ride_history", JSON.stringify(updated))
      return updated
    })
  }

  const getRideById = (id: string) => {
    return rides.find((ride) => ride.id === id)
  }

  const getTotalStats = () => {
    return rides.reduce(
      (acc, ride) => ({
        totalRides: acc.totalRides + 1,
        totalDistance: acc.totalDistance + ride.distance,
        totalDuration: acc.totalDuration + ride.duration,
        totalSpent: acc.totalSpent + ride.estimatedCost,
      }),
      {
        totalRides: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalSpent: 0,
      },
    )
  }

  return (
    <RideHistoryContext.Provider value={{ rides, isLoading, addRide, getRideById, getTotalStats }}>
      {children}
    </RideHistoryContext.Provider>
  )
}

export function useRideHistory() {
  const context = useContext(RideHistoryContext)
  if (context === undefined) {
    throw new Error("useRideHistory must be used within a RideHistoryProvider")
  }
  return context
}
