import { API_ENDPOINTS } from '../config/api'
import type { Bike } from '../types/bike'

class BikeService {
  private async fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      console.log('🚴 Fetching from URL:', url)
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
      console.log('✅ Data received:', data)
      return data
    } catch (error) {
      console.error('❌ API call failed:', error)
      throw error
    }
  }

  async getAllBikes(): Promise<Bike[]> {
    return this.fetchAPI<Bike[]>(API_ENDPOINTS.bikes.getAll())
  }

  async getBikeById(bikeId: string): Promise<Bike> {
    return this.fetchAPI<Bike>(API_ENDPOINTS.bikes.getById(bikeId))
  }

  async getBikesByStation(stationId: string): Promise<Bike[]> {
    return this.fetchAPI<Bike[]>(API_ENDPOINTS.bikes.getByStation(stationId))
  }

  async getBikesByStatus(status: string): Promise<Bike[]> {
    return this.fetchAPI<Bike[]>(API_ENDPOINTS.bikes.getByStatus(status))
  }

  async getAvailableBikesByStation(stationId: string): Promise<Bike[]> {
    return this.fetchAPI<Bike[]>(API_ENDPOINTS.bikes.getAvailableByStation(stationId))
  }

  async countAvailableBikesByStation(stationId: string): Promise<number> {
    return this.fetchAPI<number>(API_ENDPOINTS.bikes.countAvailableByStation(stationId))
  }

  async checkBikeAvailability(bikeId: string): Promise<{ bikeId: string; available: boolean }> {
    return this.fetchAPI<{ bikeId: string; available: boolean }>(
      API_ENDPOINTS.bikes.checkAvailability(bikeId)
    )
  }

  async updateBikeStatus(bikeId: string, status: string): Promise<Bike> {
    return this.fetchAPI<Bike>(API_ENDPOINTS.bikes.updateStatus(bikeId), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  async createBike(bike: Omit<Bike, 'bikeId'>): Promise<Bike> {
    return this.fetchAPI<Bike>(API_ENDPOINTS.bikes.create(), {
      method: 'POST',
      body: JSON.stringify(bike),
    })
  }

  async updateBike(bikeId: string, bike: Partial<Bike>): Promise<Bike> {
    return this.fetchAPI<Bike>(API_ENDPOINTS.bikes.update(bikeId), {
      method: 'PUT',
      body: JSON.stringify({ ...bike, bikeId }),
    })
  }

  async deleteBike(bikeId: string): Promise<void> {
    await this.fetchAPI<void>(API_ENDPOINTS.bikes.delete(bikeId), {
      method: 'DELETE',
    })
  }
}

export const bikeService = new BikeService()
