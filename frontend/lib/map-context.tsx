"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { bikeService } from "./services/bike-service"
import { stationService } from "./services/station-service"

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
  mapCenter: { lat: number; lng: number } | null
  isLoading: boolean
  setSelectedStation: (station: Station | null) => void
  setMapCenter: (center: { lat: number; lng: number }) => void
  fetchStations: () => Promise<void>
  zoomToStation: (station: Station) => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
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

  const zoomToStation = (station: Station) => {
    // Update map center to focus on the selected station
    setMapCenter({
      lat: station.location.lat,
      lng: station.location.lng,
    })
    setSelectedStation(station)
  }

  const fetchStations = async () => {
    try {
      setIsLoading(true)

      // Fetch real stations and bikes from middleware
      const [stationsFromAPI, allBikes] = await Promise.all([
        stationService.getAllStations(),
        bikeService.getAllBikes(),
      ])

      console.log('🏢 Stations from middleware:', stationsFromAPI)
      console.log('🚴 All bikes from middleware:', allBikes)

      // Group bikes by station and count available ones
      const bikesByStation = allBikes.reduce((acc, bike) => {
        if (!acc[bike.stationId]) {
          acc[bike.stationId] = { total: 0, available: 0 }
        }
        acc[bike.stationId].total++
        if (bike.status === 'AVAILABLE') {
          acc[bike.stationId].available++
        }
        return acc
      }, {} as Record<string, { total: number; available: number }>)

      console.log('📊 Bikes by station:', bikesByStation)

      // Convert API stations to frontend Station format
      const stations: Station[] = stationsFromAPI.map((apiStation) => {
        const bikeCounts = bikesByStation[apiStation.stationId] || { total: 0, available: 0 }
        return {
          id: apiStation.stationId,
          name: apiStation.name,
          address: apiStation.address,
          location: { lat: apiStation.latitude, lng: apiStation.longitude },
          availableBikes: bikeCounts.available,
          freeSlots: apiStation.totalCapacity - bikeCounts.total,
          totalSlots: apiStation.totalCapacity,
        }
      })

      console.log('✅ Final stations with bike counts:', stations)
      setStations(stations)
    } catch (error) {
      console.error("❌ Failed to fetch stations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MapContext.Provider
      value={{
        stations,
        selectedStation,
        userLocation,
        mapCenter,
        isLoading,
        setSelectedStation,
        setMapCenter,
        fetchStations,
        zoomToStation
      }}
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
