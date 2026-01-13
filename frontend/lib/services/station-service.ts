import { API_ENDPOINTS } from '../config/api'

export interface StationFromAPI {
  stationId: string
  name: string
  address: string
  latitude: number
  longitude: number
  totalCapacity: number
  availableBikes: number
}

class StationService {
  private async fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      console.log('🏢 Fetching stations from URL:', url)
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      console.log('📡 Response status:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Stations data received:', data)
      return data
    } catch (error) {
      console.error('❌ Station API call failed:', error)
      throw error
    }
  }

  async getAllStations(): Promise<StationFromAPI[]> {
    return this.fetchAPI<StationFromAPI[]>(API_ENDPOINTS.stations.getAll())
  }

  async getStationById(stationId: string): Promise<StationFromAPI> {
    return this.fetchAPI<StationFromAPI>(API_ENDPOINTS.stations.getById(stationId))
  }
}

export const stationService = new StationService()