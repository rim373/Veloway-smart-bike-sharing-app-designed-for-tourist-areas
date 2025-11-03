"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CameraCaptureProps {
  onCapture: (photo: string) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [error, setError] = useState<string>("")
  const [photoTaken, setPhotoTaken] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string>("")

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

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0)

    const photoData = canvasRef.current.toDataURL("image/jpeg")
    setCapturedPhoto(photoData)
    setPhotoTaken(true)
  }

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto)
    }
  }

  const handleRetake = () => {
    setPhotoTaken(false)
    setCapturedPhoto("")
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="flex-1 relative flex items-center justify-center">
        {!photoTaken ? (
          <>
            {hasCamera ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Frame */}
                <div className="absolute w-48 h-48 border-2 border-accent rounded-lg">
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
              </Card>
            )}
          </>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <img src={capturedPhoto || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/50 p-4 flex gap-3 justify-center">
        {!photoTaken && hasCamera && (
          <Button onClick={handleCapture} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Capture Photo
          </Button>
        )}

        {photoTaken && (
          <>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-black/30 bg-transparent"
              onClick={handleRetake}
            >
              Retake
            </Button>
            <Button onClick={handleConfirm} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Use Photo
            </Button>
          </>
        )}

        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
