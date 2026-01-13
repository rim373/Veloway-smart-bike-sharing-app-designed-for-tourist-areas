    "use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRide } from "@/lib/ride-context"
import { useMap } from "@/lib/map-context"
import { useNotifications } from "@/lib/notifications-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CameraCapture from "@/components/camera-capture"
import ReturnStationSelector from "@/components/return-station-selector"

function ReturnPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rideId = searchParams.get("rideId")
  const { user, isLoading: authLoading } = useAuth()
  const { currentRide, endRide, setPhotoCaptured } = useRide()
  const { stations } = useMap()
  const { addNotification } = useNotifications()

  const [step, setStep] = useState<"station" | "photo" | "confirmation">("station")
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [photo, setPhoto] = useState<string>("")
  const [showCamera, setShowCamera] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!currentRide) {
      router.push("/map")
    }
  }, [currentRide, router])

  const handlePhotoCapture = (photoData: string) => {
    setPhoto(photoData)
    setShowCamera(false)
    setPhotoCaptured(true)

    addNotification({
      type: "bike_alert",
      title: "Photo Captured",
      message: "Bike photo has been captured successfully",
      read: false,
      priority: "medium",
    })

    // Simulate AI defect detection
    setTimeout(() => {
      setAiResult({
        status: "success",
        message: "Bike is in good condition",
        defects: [],
      })
    }, 1500)
  }

  const handleConfirmReturn = async () => {
    if (!selectedStation) {
      addNotification({
        type: "bike_alert",
        title: "Station Required",
        message: "Please select a return station",
        read: false,
        priority: "high",
      })
      return
    }

    if (!photo || !currentRide?.photoCaptured) {
      addNotification({
        type: "bike_alert",
        title: "Photo Required",
        message: "You must take a photo of the bike before returning it",
        read: false,
        priority: "high",
      })
      return
    }

    setIsProcessing(true)

    // Simulate API call to process return
    setTimeout(() => {
      addNotification({
        type: "ride_update",
        title: "Ride Completed",
        message: "Your bike has been successfully returned",
        read: false,
        priority: "high",
      })

      endRide()
      router.push(`/completion?stationId=${selectedStation.id}`)
    }, 1000)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!currentRide) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {showCamera && <CameraCapture onCapture={handlePhotoCapture} onClose={() => setShowCamera(false)} />}

      <div className="container mx-auto px-4 py-8">
        {step === "station" && (
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-2">Select Return Station</h1>
            <p className="text-muted-foreground mb-6">Choose where to return your bike</p>

            <ReturnStationSelector
              stations={stations}
              onSelectStation={(station) => {
                setSelectedStation(station)
                setStep("photo")
              }}
            />
          </div>
        )}

        {step === "photo" && (
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Bike Photo Check</h1>
              <p className="text-muted-foreground">Take a photo of the bike for damage assessment</p>
            </div>

            <Card className="p-6 border border-border bg-card mb-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-foreground font-medium">Return Station</p>
                  <p className="text-muted-foreground text-sm mt-1">{selectedStation?.name}</p>
                </div>

                <Button
                  onClick={() => setShowCamera(true)}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {photo ? "Retake Photo" : "Take Photo"}
                </Button>

                {photo && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded text-green-700 text-sm flex items-center gap-2">
                    <span>✓</span>
                    <span>Photo captured successfully</span>
                  </div>
                )}

                {!photo && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-700 text-sm flex items-center gap-2">
                    <span>⚠</span>
                    <span>Photo is required to complete the ride</span>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border bg-transparent"
                onClick={() => setStep("station")}
              >
                Back
              </Button>
              <Button
                disabled={!photo}
                onClick={() => setStep("confirmation")}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === "confirmation" && (
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-6">Return Confirmation</h1>

            <div className="space-y-4 mb-6">
              <Card className="p-4 border border-border bg-card">
                <p className="text-muted-foreground text-sm mb-2">Return Station</p>
                <h3 className="font-bold text-foreground">{selectedStation?.name}</h3>
                <p className="text-muted-foreground text-sm">{selectedStation?.address}</p>
              </Card>

              {photo && (
                <Card className="p-4 border border-border bg-card overflow-hidden">
                  <p className="text-muted-foreground text-sm mb-2">Bike Photo</p>
                  <img src={photo || "/placeholder.svg"} alt="Bike" className="w-full rounded h-40 object-cover" />
                </Card>
              )}

              {aiResult && (
                <Card
                  className={`p-4 border-2 ${
                    aiResult.status === "success"
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-yellow-500/30 bg-yellow-500/5"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      aiResult.status === "success" ? "text-green-700" : "text-yellow-700"
                    }`}
                  >
                    AI Assessment: {aiResult.message}
                  </p>
                  {aiResult.defects?.length > 0 && (
                    <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                      {aiResult.defects.map((defect: string, i: number) => (
                        <li key={i}>• {defect}</li>
                      ))}
                    </ul>
                  )}
                </Card>
              )}

              <Card className="p-4 border border-border bg-card">
                <p className="text-muted-foreground text-sm mb-3">Trip Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Ride ID</p>
                    <p className="text-foreground font-mono text-xs">{currentRide.id.slice(-8)}</p>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <p className="text-foreground font-medium">Photo Status</p>
                    <p className="text-green-600 font-medium">✓ Captured</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border bg-transparent"
                onClick={() => {
                  setPhoto("")
                  setStep("photo")
                }}
              >
                Retake Photo
              </Button>
              <Button
                onClick={handleConfirmReturn}
                disabled={isProcessing || !photo || !aiResult}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                title={!photo ? "Photo is required to complete the ride" : ""}
              >
                {isProcessing ? "Processing..." : "Complete Return"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ReturnPageContent />
    </Suspense>
  )
}
