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
          // Default to Tunis if geolocation fails
          setUserLocation({ lat: 36.8065, lng: 10.1964 })
        },
      )
    }
  }, [])

  const fetchStations = async () => {
    try {
      setIsLoading(true)
      // Simulate API call to Tunis backend
      await new Promise((resolve) => setTimeout(resolve, 600))

      const mockStations: Station[] = [
        {
          id: "1",
          name: "Tunis Center Hub",
          address: "Avenue Habib Bourguiba, Tunis",
          location: { lat: 36.8065, lng: 10.1964 },
          availableBikes: 8,
          freeSlots: 5,
          totalSlots: 15,
        },
        {
          id: "2",
          name: "Sfax Port Station",
          address: "Avenue Mohamed Ali, Sfax",
          location: { lat: 34.7407, lng: 10.7605 },
          availableBikes: 12,
          freeSlots: 3,
          totalSlots: 15,
        },
        {
          id: "3",
          name: "Sousse Beach Hub",
          address: "Boulevard de la Corniche, Sousse",
          location: { lat: 35.825, lng: 10.6363 },
          availableBikes: 14,
          freeSlots: 1,
          totalSlots: 15,
        },
        {
          id: "4",
          name: "Djerba Airport Station",
          address: "Mellita, Djerba",
          location: { lat: 33.8754, lng: 10.7511 },
          availableBikes: 6,
          freeSlots: 9,
          totalSlots: 15,
        },
        {
          id: "5",
          name: "Gafsa Downtown",
          address: "Rue de la Gare, Gafsa",
          location: { lat: 34.4267, lng: 8.7867 },
          availableBikes: 9,
          freeSlots: 6,
          totalSlots: 15,
        },
        {
          id: "6",
          name: "Kairouan Sacred City",
          address: "Avenue Mohamed Ali, Kairouan",
          location: { lat: 35.6708, lng: 9.9208 },
          availableBikes: 11,
          freeSlots: 4,
          totalSlots: 15,
        },
        {
          id: "7",
          name: "Bizerte Harbor",
          address: "Rue Menzel Jemil, Bizerte",
          location: { lat: 37.2742, lng: 9.873 },
          availableBikes: 7,
          freeSlots: 8,
          totalSlots: 15,
        },
        {
          id: "8",
          name: "Hammamet Resort",
          address: "Avenue du Tourisme, Hammamet",
          location: { lat: 36.3906, lng: 10.619 },
          availableBikes: 13,
          freeSlots: 2,
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
