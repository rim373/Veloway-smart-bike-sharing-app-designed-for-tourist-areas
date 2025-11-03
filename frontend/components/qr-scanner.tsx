"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [isScanning, setIsScanning] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      } catch (err) {
        setHasCamera(false)
        setError("Unable to access camera. Please check permissions.")
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const scanInterval = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        // Simple QR code detection using image data patterns
        // In production, use jsQR library or similar
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Look for high contrast areas typical of QR codes
        let darkPixels = 0
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const brightness = (r + g + b) / 3
          if (brightness < 128) {
            darkPixels++
          }
        }

        const darkRatio = darkPixels / (data.length / 4)

        // Simulate QR detection by checking for reasonable dark/light ratio
        if (darkRatio > 0.3 && darkRatio < 0.7) {
          // Simulate reading QR code and extracting stationId
          const stationId = Math.floor(Math.random() * 5) + 1
          onScan(`station_${stationId}`)
          setIsScanning(false)
        }
      }
    }, 100)

    return () => clearInterval(scanInterval)
  }, [isScanning, onScan])

  const handleManualEntry = () => {
    const stationId = prompt("Enter Station ID:")
    if (stationId) {
      onScan(stationId)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="flex-1 relative flex items-center justify-center">
        {hasCamera ? (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline />
            <canvas ref={canvasRef} className="hidden" />

            {/* QR Scanner Frame */}
            <div className="absolute w-64 h-64 border-2 border-accent rounded-lg">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent"></div>
            </div>
          </>
        ) : (
          <Card className="max-w-sm p-6 bg-card border border-border">
            <p className="text-foreground font-semibold mb-2">Camera Not Available</p>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button onClick={handleManualEntry} className="w-full bg-primary hover:bg-primary/90">
              Enter Station ID Manually
            </Button>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/50 p-4 flex gap-3 justify-center">
        <Button
          variant="outline"
          className="border-accent text-accent hover:bg-accent/10 bg-transparent"
          onClick={handleManualEntry}
        >
          Manual Entry
        </Button>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  )
}
