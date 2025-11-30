"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useMap } from "@/lib/map-context"
import { Loader, ZoomIn, ZoomOut } from "lucide-react"

export default function MapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { stations, userLocation, selectedStation, setSelectedStation } = useMap()
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(10)
  const tilesRef = useRef<Map<string, HTMLImageElement>>({})

  const latLngToTile = (lat: number, lng: number, zoomLevel: number) => {
    const n = Math.pow(2, zoomLevel)
    const x = Math.floor(((lng + 180) / 360) * n)
    const y = Math.floor(
      ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * n,
    )
    return { x, y }
  }

  const projectToCanvas = (
    lat: number,
    lng: number,
    centerLat: number,
    centerLng: number,
    zoomLevel: number,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    const centerTile = latLngToTile(centerLat, centerLng, zoomLevel)
    const pointTile = latLngToTile(lat, lng, zoomLevel)

    const tileSize = 256
    const pixelsPerTile = tileSize
    const x = (pointTile.x - centerTile.x) * pixelsPerTile + canvasWidth / 2
    const y = (pointTile.y - centerTile.y) * pixelsPerTile + canvasHeight / 2

    return { x, y }
  }

  const renderMap = async (canvas: HTMLCanvasElement) => {
    if (!userLocation) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const tileSize = 256
    const centerTile = latLngToTile(userLocation.lat, userLocation.lng, zoom)

    ctx.fillStyle = "#e5e7eb"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const tilesAcross = Math.ceil(canvas.width / tileSize) + 2
    const tilesDown = Math.ceil(canvas.height / tileSize) + 2

    for (let dx = -Math.floor(tilesAcross / 2); dx <= Math.floor(tilesAcross / 2); dx++) {
      for (let dy = -Math.floor(tilesDown / 2); dy <= Math.floor(tilesDown / 2); dy++) {
        const tileX = centerTile.x + dx
        const tileY = centerTile.y + dy

        if (tileX < 0 || tileX >= Math.pow(2, zoom) || tileY < 0 || tileY >= Math.pow(2, zoom)) continue

        const tileKey = `${zoom}/${tileX}/${tileY}`
        const pixelX = (tileX - centerTile.x) * tileSize + canvas.width / 2
        const pixelY = (tileY - centerTile.y) * tileSize + canvas.height / 2

        if (tilesRef.current[tileKey]) {
          ctx.drawImage(tilesRef.current[tileKey], pixelX, pixelY, tileSize, tileSize)
        } else {
          ctx.fillStyle = "#f3f4f6"
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize)
          ctx.strokeStyle = "#d1d5db"
          ctx.strokeRect(pixelX, pixelY, tileSize, tileSize)

          const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            tilesRef.current[tileKey] = img
            ctx.drawImage(img, pixelX, pixelY, tileSize, tileSize)
          }
          img.onerror = () => {
            ctx.fillStyle = "#f9fafb"
            ctx.fillRect(pixelX, pixelY, tileSize, tileSize)
          }
          img.src = tileUrl
        }
      }
    }

    const userPos = projectToCanvas(
      userLocation.lat,
      userLocation.lng,
      userLocation.lat,
      userLocation.lng,
      zoom,
      canvas.width,
      canvas.height,
    )
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(userPos.x, userPos.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.stroke()

    stations.forEach((station) => {
      const pos = projectToCanvas(
        station.location.lat,
        station.location.lng,
        userLocation.lat,
        userLocation.lng,
        zoom,
        canvas.width,
        canvas.height,
      )
      const isSelected = selectedStation?.id === station.id

      // Draw flag marker
      if (isSelected) {
        // Selected station: larger flag with glow effect
        ctx.shadowColor = "rgba(6, 182, 212, 0.5)"
        ctx.shadowBlur = 15
        ctx.fillStyle = "#06b6d4"
      } else {
        // Unselected: teal flag
        ctx.shadowColor = "rgba(0, 0, 0, 0)"
        ctx.shadowBlur = 0
        ctx.fillStyle = "#0d9488"
      }

      // Draw flag pole
      ctx.fillRect(pos.x - 2, pos.y, 4, 20)

      // Draw flag triangle
      ctx.beginPath()
      ctx.moveTo(pos.x + 2, pos.y)
      ctx.lineTo(pos.x + 2, pos.y + 12)
      ctx.lineTo(pos.x + 14, pos.y + 6)
      ctx.closePath()
      ctx.fill()

      // Draw station number on flag
      ctx.shadowColor = "rgba(0, 0, 0, 0)"
      ctx.shadowBlur = 0
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 9px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(station.availableBikes.toString(), pos.x + 7, pos.y + 6)
    })

    setLoading(false)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !userLocation) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      renderMap(canvas)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [userLocation, stations, selectedStation, zoom])

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const newZoom = e.deltaY > 0 ? Math.max(zoom - 1, 1) : Math.min(zoom + 1, 18)
    setZoom(newZoom)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !userLocation) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    stations.forEach((station) => {
      const pos = projectToCanvas(
        station.location.lat,
        station.location.lng,
        userLocation.lat,
        userLocation.lng,
        zoom,
        canvas.width,
        canvas.height,
      )
      const distance = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2)

      if (distance < 20) {
        setSelectedStation(station)
      }
    })
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader className="animate-spin text-teal-600" size={24} />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={() => setZoom(Math.min(zoom + 1, 18))}
          className="bg-white rounded-lg p-2 shadow-lg hover:bg-gray-50 transition active:scale-95"
          title="Zoom in"
        >
          <ZoomIn size={20} className="text-gray-700" />
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 1, 1))}
          className="bg-white rounded-lg p-2 shadow-lg hover:bg-gray-50 transition active:scale-95"
          title="Zoom out"
        >
          <ZoomOut size={20} className="text-gray-700" />
        </button>
        <div className="bg-white rounded-lg px-3 py-2 shadow-lg text-center text-sm text-gray-700 font-medium">
          {zoom}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-pointer"
        style={{ minHeight: "400px" }}
      />
    </div>
  )
}
