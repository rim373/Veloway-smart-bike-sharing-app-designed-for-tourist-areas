export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/iam-1.0/api'

export const API_ENDPOINTS = {
  bikes: {
    getAll: () => `${API_BASE_URL}/bikes`,
    getById: (bikeId: string) => `${API_BASE_URL}/bikes/${bikeId}`,
    getByStation: (stationId: string) => `${API_BASE_URL}/bikes/by-station/${stationId}`,
    getByStatus: (status: string) => `${API_BASE_URL}/bikes/status/${status}`,
    getAvailableByStation: (stationId: string) => `${API_BASE_URL}/bikes/available/station/${stationId}`,
    countAvailableByStation: (stationId: string) => `${API_BASE_URL}/bikes/available/station/${stationId}/count`,
    checkAvailability: (bikeId: string) => `${API_BASE_URL}/bikes/${bikeId}/availability`,
    updateStatus: (bikeId: string) => `${API_BASE_URL}/bikes/${bikeId}/status`,
    create: () => `${API_BASE_URL}/bikes`,
    update: (bikeId: string) => `${API_BASE_URL}/bikes/${bikeId}`,
    delete: (bikeId: string) => `${API_BASE_URL}/bikes/${bikeId}`,
  },
}
