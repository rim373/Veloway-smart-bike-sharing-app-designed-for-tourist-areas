"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useMap } from "@/lib/map-context"

// Import des icônes Leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png"
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png"

// ✅ Utilisation correcte sous Next.js (besoin du .src)
const DefaultIcon = L.icon({
  iconUrl: (iconUrl as unknown as { src: string }).src,
  shadowUrl: (iconShadowUrl as unknown as { src: string }).src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// ✅ Appliquer l’icône par défaut à tous les marqueurs
L.Marker.prototype.options.icon = DefaultIcon

export default function MapView() {
  const { stations, userLocation, selectedStation } = useMap()

  if (!userLocation) {
    return <p className="text-center text-gray-500">Chargement de la carte...</p>
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Position de l'utilisateur */}
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>📍 Votre position</Popup>
        </Marker>

        {/* Marqueurs stations */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.location.lat, station.location.lng]}
          >
            <Popup>
              <strong>{station.name}</strong>
              <br />
              {selectedStation?.id === station.id ? "✅ Sélectionnée" : ""}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
