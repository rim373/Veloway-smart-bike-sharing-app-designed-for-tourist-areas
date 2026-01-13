export interface Bike {
  bikeId: string
  serialNumber: string
  brand: string
  model: string
  batteryLevel: number
  status: string
  stationId: string
}

export type BikeStatus = 'available' | 'in_use' | 'maintenance' | 'unavailable'
