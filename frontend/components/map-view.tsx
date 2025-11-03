"use client"

import { useEffect, useRef } from "react"
import { useMap } from "@/lib/map-context"

export default function MapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { stations, userLocation, selectedStation } = useMap()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !userLocation) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to fill container
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    // Draw map background
    ctx.fillStyle = "#f5f5f5"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1
    for (let i = 0; i <= canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i <= canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Calculate bounds
    const lats = stations.map((s) => s.location.lat)
    const lngs = stations.map((s) => s.location.lng)
    const minLat = Math.min(...lats, userLocation.lat)
    const maxLat = Math.max(...lats, userLocation.lat)
    const minLng = Math.min(...lngs, userLocation.lng)
    const maxLng = Math.max(...lngs, userLocation.lng)

    const padding = 40
    const scale = Math.min(
      (canvas.width - 2 * padding) / (maxLng - minLng || 1),
      (canvas.height - 2 * padding) / (maxLat - minLat || 1),
    )

    // Convert lat/lng to canvas coordinates
    const toCanvasX = (lng: number) => padding + (lng - minLng) * scale
    const toCanvasY = (lat: number) => canvas.height - padding - (lat - minLat) * scale

    // Draw user location
    const userX = toCanvasX(userLocation.lng)
    const userY = toCanvasY(userLocation.lat)

    // Draw user circle with pulse effect
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(userX, userY, 8, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(userX, userY, 16, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1.0

    // Draw stations
    stations.forEach((station) => {
      const x = toCanvasX(station.location.lng)
      const y = toCanvasY(station.location.lat)

      const isSelected = selectedStation?.id === station.id

      // Draw station circle
      ctx.fillStyle = isSelected ? "#06b6d4" : "#0d9488"
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, Math.PI * 2)
      ctx.fill()

      // Draw border if selected
      if (isSelected) {
        ctx.strokeStyle = "#06b6d4"
        ctx.lineWidth = 3
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(x, y, 20, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1.0
      }

      // Draw station label
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(station.name.split(" ")[0], x, y + 28)
    })
  }, [stations, userLocation, selectedStation])

  return (
    <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={(e) => {
          const canvas = canvasRef.current
          if (!canvas) return

          const rect = canvas.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const clickY = e.clientY - rect.top

          // Check if click is near a station
          const lats = stations.map((s) => s.location.lat)
          const lngs = stations.map((s) => s.location.lng)
          const minLat = Math.min(...lats, userLocation?.lat || 0)
          const maxLat = Math.max(...lats, userLocation?.lat || 0)
          const minLng = Math.min(...lngs, userLocation?.lng || 0)
          const maxLng = Math.max(...lngs, userLocation?.lng || 0)

          const padding = 40
          const scale = Math.min(
            (canvas.width - 2 * padding) / (maxLng - minLng || 1),
            (canvas.height - 2 * padding) / (maxLat - minLat || 1),
          )

          const toCanvasX = (lng: number) => padding + (lng - minLng) * scale
          const toCanvasY = (lat: number) => canvas.height - padding - (lat - minLat) * scale

          stations.forEach((station) => {
            const x = toCanvasX(station.location.lng)
            const y = toCanvasY(station.location.lat)
            const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2)

            if (distance < 20) {
              // setSelectedStation is called in the main map page
            }
          })
        }}
      />
    </div>
  )
}
