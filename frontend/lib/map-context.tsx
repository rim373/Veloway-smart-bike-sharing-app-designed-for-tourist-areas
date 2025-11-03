"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface Station {
  id: string
  name: string
  address: string
  location: { lat: number; lng: number }
  availableBikes: number
  freeSlots: number
  totalSlots: number
}

interface MapContextType {
  stations: Station[]
  selectedStation: Station | null
  userLocation: { lat: number; lng: number } | null
  isLoading: boolean
  setSelectedStation: (station: Station | null) => void
  fetchStations: () => Promise<void>
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // Default to NYC if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.006 })
        },
      )
    }
  }, [])

  const fetchStations = async () => {
    try {
      setIsLoading(true)
      // Simulate API call to Jakarta backend
      await new Promise((resolve) => setTimeout(resolve, 600))

      const mockStations: Station[] = [
        {
          id: "1",
          name: "Downtown Hub",
          address: "123 Main Street",
          location: { lat: 40.7128, lng: -74.006 },
          availableBikes: 8,
          freeSlots: 5,
          totalSlots: 15,
        },
        {
          id: "2",
          name: "Central Park",
          address: "42 Park Avenue",
          location: { lat: 40.7829, lng: -73.9654 },
          availableBikes: 12,
          freeSlots: 3,
          totalSlots: 15,
        },
        {
          id: "3",
          name: "Brooklyn Bridge",
          address: "88 East River",
          location: { lat: 40.7061, lng: -73.9969 },
          availableBikes: 5,
          freeSlots: 10,
          totalSlots: 15,
        },
        {
          id: "4",
          name: "Times Square",
          address: "1540 Broadway",
          location: { lat: 40.758, lng: -73.9855 },
          availableBikes: 15,
          freeSlots: 0,
          totalSlots: 15,
        },
        {
          id: "5",
          name: "Upper West Side",
          address: "300 Central Park West",
          location: { lat: 40.774, lng: -73.9789 },
          availableBikes: 9,
          freeSlots: 6,
          totalSlots: 15,
        },
      ]

      setStations(mockStations)
    } catch (error) {
      console.error("Failed to fetch stations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MapContext.Provider
      value={{ stations, selectedStation, userLocation, isLoading, setSelectedStation, fetchStations }}
    >
      {children}
    </MapContext.Provider>
  )
}

export function useMap() {
  const context = useContext(MapContext)
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider")
  }
  return context
}
