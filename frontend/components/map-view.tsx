"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { useMap } from "@/lib/map-context"
import { Loader, ZoomIn, ZoomOut, MapPin } from "lucide-react"

export default function MapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { stations, userLocation, selectedStation, setSelectedStation, mapCenter, setMapCenter } = useMap()
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(6)
  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 34.5, lng: 9.5 })
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null)
  const tilesRef = useRef<Record<string, HTMLImageElement>>({})
  const isDraggingRef = useRef(false)
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null)

  // Update center when mapCenter from context changes
  useEffect(() => {
    if (mapCenter) {
      setCenter(mapCenter)
      setZoom(10) // Zoom in when focusing on a station
    }
  }, [mapCenter])

  // Update center when stations load
  useEffect(() => {
    if (stations.length > 0 && !mapCenter) {
      // Calculate the center of all stations
      const avgLat = stations.reduce((sum, s) => sum + s.location.lat, 0) / stations.length
      const avgLng = stations.reduce((sum, s) => sum + s.location.lng, 0) / stations.length
      setCenter({ lat: avgLat, lng: avgLng })
    }
  }, [stations, mapCenter])

  const latLngToTile = useCallback((lat: number, lng: number, zoomLevel: number) => {
    const n = Math.pow(2, zoomLevel)
    const x = Math.floor(((lng + 180) / 360) * n)
    const latRad = (lat * Math.PI) / 180
    const y = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
    )
    return { x, y }
  }, [])

  const projectToCanvas = useCallback((
    lat: number,
    lng: number,
    centerLat: number,
    centerLng: number,
    zoomLevel: number,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    const tileSize = 256
    const scale = Math.pow(2, zoomLevel)

    const centerX = ((centerLng + 180) / 360) * scale * tileSize
    const centerLatRad = (centerLat * Math.PI) / 180
    const centerY = ((1 - Math.log(Math.tan(centerLatRad) + 1 / Math.cos(centerLatRad)) / Math.PI) / 2) * scale * tileSize

    const pointX = ((lng + 180) / 360) * scale * tileSize
    const pointLatRad = (lat * Math.PI) / 180
    const pointY = ((1 - Math.log(Math.tan(pointLatRad) + 1 / Math.cos(pointLatRad)) / Math.PI) / 2) * scale * tileSize

    return {
      x: (pointX - centerX) + canvasWidth / 2,
      y: (pointY - centerY) + canvasHeight / 2
    }
  }, [])

  const drawBikeMarker = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isSelected: boolean,
    availableBikes: number
  ) => {
    const size = isSelected ? 1.6 : 1.2
    const baseSize = 25

    // Draw shadow
    ctx.save()
    ctx.shadowColor = isSelected ? "rgba(6, 182, 212, 0.5)" : "rgba(0, 0, 0, 0.3)"
    ctx.shadowBlur = isSelected ? 15 : 8
    ctx.shadowOffsetY = 3

    // Draw pin background
    ctx.fillStyle = isSelected ? "#06b6d4" : "#0d9488"
    ctx.beginPath()
    ctx.arc(x, y - 10 * size, baseSize * size, 0, Math.PI * 2)
    ctx.fill()

    // Draw pin point
    ctx.beginPath()
    ctx.moveTo(x - 8 * size, y - 10 * size)
    ctx.lineTo(x, y + 5 * size)
    ctx.lineTo(x + 8 * size, y - 10 * size)
    ctx.fill()

    ctx.restore()

    // Draw bike icon (simplified)
    ctx.save()
    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${14 * size}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("🚴", x, y - 10 * size)
    ctx.restore()

    // Draw availability badge
    ctx.save()
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(x, y + 10 * size, 12 * size, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = isSelected ? "#06b6d4" : "#0d9488"
    ctx.font = `bold ${11 * size}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(availableBikes.toString(), x, y + 10 * size)
    ctx.restore()
  }, [])

  const renderMap = useCallback(async (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentCenter = center
    const currentZoom = zoom
    const tileSize = 256
    const scale = Math.pow(2, currentZoom)

    // Calculate center in tile coordinates (with decimals for precision)
    const centerTileX = ((currentCenter.lng + 180) / 360) * scale
    const centerLatRad = (currentCenter.lat * Math.PI) / 180
    const centerTileY = ((1 - Math.log(Math.tan(centerLatRad) + 1 / Math.cos(centerLatRad)) / Math.PI) / 2) * scale

    // Clear canvas with light background
    ctx.fillStyle = "#e0f2fe"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const tilesAcross = Math.ceil(canvas.width / tileSize) + 2
    const tilesDown = Math.ceil(canvas.height / tileSize) + 2

    // Draw map tiles
    const tilePromises: Promise<void>[] = []
    const centerTileXFloor = Math.floor(centerTileX)
    const centerTileYFloor = Math.floor(centerTileY)
    const offsetX = (centerTileX - centerTileXFloor) * tileSize
    const offsetY = (centerTileY - centerTileYFloor) * tileSize

    for (let dx = -Math.floor(tilesAcross / 2); dx <= Math.floor(tilesAcross / 2); dx++) {
      for (let dy = -Math.floor(tilesDown / 2); dy <= Math.floor(tilesDown / 2); dy++) {
        const tileX = centerTileXFloor + dx
        const tileY = centerTileYFloor + dy

        if (tileX < 0 || tileX >= Math.pow(2, currentZoom) || tileY < 0 || tileY >= Math.pow(2, currentZoom)) continue

        const tileKey = `${currentZoom}/${tileX}/${tileY}`
        const pixelX = (tileX - centerTileXFloor) * tileSize + canvas.width / 2 - offsetX
        const pixelY = (tileY - centerTileYFloor) * tileSize + canvas.height / 2 - offsetY

        if (tilesRef.current[tileKey]) {
          try {
            ctx.drawImage(tilesRef.current[tileKey], pixelX, pixelY, tileSize, tileSize)
          } catch (e) {
            console.error("Error drawing cached tile:", e)
          }
        } else {
          // Draw placeholder
          ctx.fillStyle = "#f0f9ff"
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize)
          ctx.strokeStyle = "#cbd5e1"
          ctx.strokeRect(pixelX, pixelY, tileSize, tileSize)

          const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`
          const img = new Image()
          img.crossOrigin = "anonymous"

          const promise = new Promise<void>((resolve) => {
            img.onload = () => {
              tilesRef.current[tileKey] = img
              try {
                ctx.drawImage(img, pixelX, pixelY, tileSize, tileSize)
              } catch (e) {
                console.error("Error drawing new tile:", e)
              }
              resolve()
            }
            img.onerror = () => {
              resolve()
            }
          })

          img.src = tileUrl
          tilePromises.push(promise)
        }
      }
    }

    // Wait for some tiles to load
    await Promise.race([
      Promise.all(tilePromises),
      new Promise(resolve => setTimeout(resolve, 300))
    ])

    // Draw user location if available
    if (userLocation) {
      const userPos = projectToCanvas(
        userLocation.lat,
        userLocation.lng,
        currentCenter.lat,
        currentCenter.lng,
        currentZoom,
        canvas.width,
        canvas.height,
      )

      if (userPos.x >= 0 && userPos.x <= canvas.width && userPos.y >= 0 && userPos.y <= canvas.height) {
        ctx.save()
        ctx.shadowColor = "rgba(59, 130, 246, 0.5)"
        ctx.shadowBlur = 15
        ctx.fillStyle = "#3b82f6"
        ctx.beginPath()
        ctx.arc(userPos.x, userPos.y, 12, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(userPos.x, userPos.y, 12, 0, Math.PI * 2)
        ctx.stroke()

        // Draw pulse effect
        ctx.strokeStyle = "rgba(59, 130, 246, 0.3)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(userPos.x, userPos.y, 18, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    // Draw station markers (always draw them, even if slightly off screen)
    const drawAllMarkers = () => {
      stations.forEach((station) => {
        const pos = projectToCanvas(
          station.location.lat,
          station.location.lng,
          currentCenter.lat,
          currentCenter.lng,
          currentZoom,
          canvas.width,
          canvas.height,
        )

        // Draw all markers within a larger bounds to ensure visibility
        if (pos.x >= -100 && pos.x <= canvas.width + 100 && pos.y >= -100 && pos.y <= canvas.height + 100) {
          const isSelected = selectedStation?.id === station.id
          drawBikeMarker(ctx, pos.x, pos.y, isSelected, station.availableBikes)
        }
      })
    }

    drawAllMarkers()

    // Force redraw after tiles load to ensure markers are on top
    if (tilePromises.length > 0) {
      setTimeout(drawAllMarkers, 500)
    }

    setLoading(false)
  }, [center, stations, selectedStation, zoom, userLocation, latLngToTile, projectToCanvas, drawBikeMarker])

  // Clean up old tiles when zoom changes
  useEffect(() => {
    const maxTiles = 100
    const currentTiles = Object.keys(tilesRef.current)
    if (currentTiles.length > maxTiles) {
      const tilesToKeep = currentTiles.filter(key => key.startsWith(`${zoom}/`))
      const newCache: Record<string, HTMLImageElement> = {}
      tilesToKeep.forEach(key => {
        newCache[key] = tilesRef.current[key]
      })
      tilesRef.current = newCache
    }
  }, [zoom])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let resizeTimeout: NodeJS.Timeout

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        renderMap(canvas)
      }, 100)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      clearTimeout(resizeTimeout)
    }
  }, [center, stations, selectedStation, zoom, userLocation, renderMap])

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1
    setZoom(prev => Math.max(6, Math.min(12, prev + delta)))
    // Close popup when zooming to avoid position mismatch
    setPopupPosition(null)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !lastMousePosRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const dx = e.clientX - lastMousePosRef.current.x
    const dy = e.clientY - lastMousePosRef.current.y

    // Convert pixel movement to lat/lng movement
    const scale = Math.pow(2, zoom)
    const tileSize = 256
    const lngPerPixel = 360 / (scale * tileSize)
    const latPerPixel = 170 / (scale * tileSize) // Approximate

    setCenter(prev => ({
      lat: prev.lat + (dy * latPerPixel),
      lng: prev.lng - (dx * lngPerPixel)
    }))

    // Close popup when dragging
    setPopupPosition(null)

    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
  }, [zoom])

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false
    lastMousePosRef.current = null
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    let clickedStation: typeof stations[0] | null = null
    let minDistance = Infinity
    let stationScreenPos: { x: number; y: number } | null = null

    stations.forEach((station) => {
      const pos = projectToCanvas(
        station.location.lat,
        station.location.lng,
        center.lat,
        center.lng,
        zoom,
        canvas.width,
        canvas.height,
      )
      const distance = Math.sqrt((clickX - pos.x) ** 2 + (clickY - pos.y) ** 2)

      if (distance < 35 && distance < minDistance) {
        minDistance = distance
        clickedStation = station
        stationScreenPos = { x: pos.x + rect.left, y: pos.y + rect.top }
      }
    })

    if (clickedStation && stationScreenPos) {
      setSelectedStation(clickedStation)
      setPopupPosition(stationScreenPos)
    } else {
      setPopupPosition(null)
    }
  }, [stations, zoom, center, projectToCanvas, setSelectedStation])

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-sky-100">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-50 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader className="animate-spin text-teal-600" size={32} />
            <p className="text-sm text-gray-600 font-medium">Loading map...</p>
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 1, 12))}
          className="bg-white rounded-lg p-3 shadow-lg hover:bg-gray-50 transition active:scale-95 border border-gray-200"
          title="Zoom in"
        >
          <ZoomIn size={20} className="text-gray-700" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 1, 6))}
          className="bg-white rounded-lg p-3 shadow-lg hover:bg-gray-50 transition active:scale-95 border border-gray-200"
          title="Zoom out"
        >
          <ZoomOut size={20} className="text-gray-700" />
        </button>
        <div className="bg-white rounded-lg px-3 py-2 shadow-lg text-center text-sm text-gray-700 font-medium border border-gray-200">
          Zoom: {zoom}
        </div>
      </div>

      {/* Station count indicator */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-4 py-2 shadow-lg z-20 border border-gray-200">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-teal-600" />
          <span className="text-sm font-medium text-gray-700">
            {stations.length} stations disponibles
          </span>
        </div>
      </div>

      {/* Station Popup */}
      {selectedStation && popupPosition && (
        <div
          className="absolute z-30 bg-white rounded-lg shadow-2xl border-2 border-teal-500 p-4 min-w-[280px] animate-in fade-in zoom-in duration-200"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y - 120}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedStation(null)
              setPopupPosition(null)
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 8.586L3.707 2.293a1 1 0 00-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293a1 1 0 001.414-1.414L11.414 10l6.293-6.293a1 1 0 00-1.414-1.414L10 8.586z"/>
            </svg>
          </button>

          {/* Station info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900 pr-6">{selectedStation.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedStation.address}</p>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 bg-teal-50 rounded-lg p-3 border border-teal-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚴</span>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-medium">Bikes</p>
                    <p className="text-2xl font-bold text-teal-600">{selectedStation.availableBikes}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🅿️</span>
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-medium">Free Slots</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedStation.freeSlots}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow pointing to marker */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-white border-r-2 border-b-2 border-teal-500 rotate-45"
          />
        </div>
      )}

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ minHeight: "400px" }}
      />
    </div>
  )
}
