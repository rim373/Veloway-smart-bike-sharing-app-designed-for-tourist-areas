"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// ==============================
// 🔹 Interfaces
// ==============================
export interface Station {
  id: string;
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

  // ✅ Récupération de la position utilisateur
  useEffect(() => {
    if (typeof window === "undefined") return; // 🔥 Empêche l’exécution côté serveur

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("⚠️ Géolocalisation refusée :", error.message);
          // 📍 Par défaut : Tunis
          setUserLocation({ lat: 36.8065, lng: 10.1815 });
        }
      );
    } else {
      // 📍 Si géolocalisation non supportée
      setUserLocation({ lat: 36.8065, lng: 10.1815 });
    }
  }, []);

  // ✅ Chargement (mock) des stations
  const fetchStations = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 600)); // simulation API

      const mockStations: Station[] = [
        {
          id: "1",
          name: "Lac 1",
          address: "123 Main Street",
          location: { lat: 36.8028, lng: 10.1786 },
          availableBikes: 8,
          freeSlots: 5,
          totalSlots: 15,
        },
        {
          id: "2",
          name: "Cité Olympique",
          address: "Avenue Mohamed 5",
          location: { lat: 36.8351, lng: 10.1923 },
          availableBikes: 12,
          freeSlots: 3,
          totalSlots: 15,
        },
        {
          id: "3",
          name: "La Marsa",
          address: "Rue de la Corniche",
          location: { lat: 36.8786, lng: 10.3247 },
          availableBikes: 9,
          freeSlots: 6,
          totalSlots: 15,
        },
      ];

      setStations(mockStations);
    } catch (error) {
      console.error("❌ Échec du chargement des stations :", error);
    } finally {
      setIsLoading(false);
    }
  };

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
  if (context === undefined) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}

