"use client"

import { useEffect, useRef, useState } from "react"
import { useRide } from "@/lib/ride-context"

interface RideTrackingMapProps {
  onLocationUpdate: (location: { lat: number; lng: number }) => void
}

export default function RideTrackingMap({ onLocationUpdate }: RideTrackingMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [startLocation, setStartLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [path, setPath] = useState<{ lat: number; lng: number }[]>([])
  const [isLoadingGPS, setIsLoadingGPS] = useState(true)

  const { currentRide } = useRide()

  // Real-time GPS tracking
  useEffect(() => {
    if (!("geolocation" in navigator)) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCurrentLocation(location)
        setIsLoadingGPS(false)

        // Set start location on first GPS fix
        if (!startLocation) {
          setStartLocation(location)
        }

        setPath((prev) => {
          // Only add point if it's significantly different from the last one (avoid duplicates)
          if (
            prev.length === 0 ||
            Math.abs(prev[prev.length - 1].lat - location.lat) > 0.00001 ||
            Math.abs(prev[prev.length - 1].lng - location.lng) > 0.00001
          ) {
            return [...prev, location]
          }
          return prev
        })
        onLocationUpdate(location)
      },
      (error) => {
        console.error("GPS Error:", error)
        setIsLoadingGPS(false)
        // Use a default location if GPS fails
        const defaultLocation = { lat: 40.7128, lng: -74.006 }
        setCurrentLocation(defaultLocation)
        setStartLocation(defaultLocation)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [onLocationUpdate, startLocation])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    // Background
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#333333"
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Show loading state if GPS hasn't loaded
    if (isLoadingGPS || !currentLocation) {
      ctx.fillStyle = "#ffffff"
      ctx.font = "16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Acquiring GPS location...", canvas.width / 2, canvas.height / 2 - 20)
      ctx.font = "12px sans-serif"
      ctx.fillStyle = "#999999"
      ctx.fillText("Make sure location permissions are enabled", canvas.width / 2, canvas.height / 2 + 20)
      return
    }

    // If we have at least one location, render the map
    if (!path.length) {
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, Math.PI * 2)
      ctx.fill()
      return
    }

    // Calculate bounds from the path
    const lats = path.map((p) => p.lat)
    const lngs = path.map((p) => p.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const padding = 30
    const scale = Math.min(
      (canvas.width - 2 * padding) / Math.max(maxLng - minLng, 0.0001),
      (canvas.height - 2 * padding) / Math.max(maxLat - minLat, 0.0001),
    )

    const toCanvasX = (lng: number) => padding + (lng - minLng) * scale
    const toCanvasY = (lat: number) => canvas.height - padding - (lat - minLat) * scale

    // Draw path
    ctx.strokeStyle = "#06b6d4"
    ctx.lineWidth = 3
    ctx.lineJoin = "round"
    ctx.lineCap = "round"

    ctx.beginPath()
    path.forEach((point, index) => {
      const x = toCanvasX(point.lng)
      const y = toCanvasY(point.lat)
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw start point
    const startX = toCanvasX(path[0].lng)
    const startY = toCanvasY(path[0].lat)
    ctx.fillStyle = "#10b981"
    ctx.beginPath()
    ctx.arc(startX, startY, 8, 0, Math.PI * 2)
    ctx.fill()

    // Draw current location
    const currentX = toCanvasX(currentLocation.lng)
    const currentY = toCanvasY(currentLocation.lat)
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(currentX, currentY, 10, 0, Math.PI * 2)
    ctx.fill()

    // Pulse effect
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(currentX, currentY, 18, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1.0
  }, [path, currentLocation, isLoadingGPS])

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
