"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ==============================
// 🔹 Interfaces
// ==============================
export interface Station {
  _id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  availableBikes: number;
  freeSlots: number;
  totalSlots: number;
}

interface MapContextType {
  stations: Station[];
  selectedStation: Station | null;
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
  setSelectedStation: (station: Station | null) => void;
  fetchStations: () => Promise<void>;
}

// ==============================
// 🔹 Création du contexte
// ==============================
const MapContext = createContext<MapContextType | undefined>(undefined);

// ==============================
// 🔹 Provider principal
// ==============================
export function MapProvider({ children }: { children: React.ReactNode }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Récupération de la position utilisateur
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // 📍 Valeur par défaut si géolocalisation refusée
          setUserLocation({ lat: 36.8065, lng: 10.1815 });
        }
      );
    } else {
      setUserLocation({ lat: 36.8065, lng: 10.1815 });
    }
  }, []);

  // 🔹 Chargement des stations depuis l'API et conversion GeoJSON → Leaflet
  const fetchStations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/stations"); // API Next.js
      if (!res.ok) throw new Error("Erreur API");

      const dataFromApi = await res.json();

      // 🔹 Transformation GeoJSON → {lat, lng}
      const stations: Station[] = dataFromApi.map((station: any) => ({
        _id: station._id,
        name: station.name,
        address: station.address,
        location: {
          lat: station.location.coordinates[1], // latitude
          lng: station.location.coordinates[0], // longitude
        },
        availableBikes: station.availableBikes,
        freeSlots: station.freeSlots,
        totalSlots: station.totalSlots,
      }));

      setStations(stations);
    } catch (error) {
      console.error("❌ Échec du chargement des stations :", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Fetch au montage
  useEffect(() => {
    fetchStations();
  }, []);

  return (
    <MapContext.Provider
      value={{ stations, selectedStation, userLocation, isLoading, setSelectedStation, fetchStations }}
    >
      {children}
    </MapContext.Provider>
  );
}

// ==============================
// 🔹 Hook personnalisé
// ==============================
export function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a MapProvider");
  return context;
}
