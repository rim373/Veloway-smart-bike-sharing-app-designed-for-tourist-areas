"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { bikeService } from "./services/bike-service"
import type { Bike } from "./types/bike"

interface BikeContextType {
  bikes: Bike[]
  loading: boolean
  error: string | null
  fetchAllBikes: () => Promise<void>
  fetchBikesByStation: (stationId: string) => Promise<Bike[]>
  fetchAvailableBikesByStation: (stationId: string) => Promise<Bike[]>
  countAvailableBikesByStation: (stationId: string) => Promise<number>
  getBikeById: (bikeId: string) => Promise<Bike | undefined>
  refreshBikes: () => Promise<void>
}

const BikeContext = createContext<BikeContextType | undefined>(undefined)

export function BikeProvider({ children }: { children: React.ReactNode }) {
  const [bikes, setBikes] = useState<Bike[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAllBikes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await bikeService.getAllBikes()
      setBikes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bikes')
      console.error('Error fetching bikes:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBikesByStation = async (stationId: string): Promise<Bike[]> => {
    try {
      const data = await bikeService.getBikesByStation(stationId)
      return data
    } catch (err) {
      console.error('Error fetching bikes by station:', err)
      return []
    }
  }

  const fetchAvailableBikesByStation = async (stationId: string): Promise<Bike[]> => {
    try {
      const data = await bikeService.getAvailableBikesByStation(stationId)
      return data
    } catch (err) {
      console.error('Error fetching available bikes by station:', err)
      return []
    }
  }

  const countAvailableBikesByStation = async (stationId: string): Promise<number> => {
    try {
      const count = await bikeService.countAvailableBikesByStation(stationId)
      return count
    } catch (err) {
      console.error('Error counting available bikes by station:', err)
      return 0
    }
  }

  const getBikeById = async (bikeId: string): Promise<Bike | undefined> => {
    try {
      const bike = await bikeService.getBikeById(bikeId)
      return bike
    } catch (err) {
      console.error('Error fetching bike by ID:', err)
      return undefined
    }
  }

  const refreshBikes = async () => {
    await fetchAllBikes()
  }

  // Initial load
  useEffect(() => {
    fetchAllBikes()
  }, [])

  return (
    <BikeContext.Provider
      value={{
        bikes,
        loading,
        error,
        fetchAllBikes,
        fetchBikesByStation,
        fetchAvailableBikesByStation,
        countAvailableBikesByStation,
        getBikeById,
        refreshBikes,
      }}
    >
      {children}
    </BikeContext.Provider>
  )
}

export function useBikes() {
  const context = useContext(BikeContext)
  if (context === undefined) {
    throw new Error("useBikes must be used within a BikeProvider")
  }
  return context
}
