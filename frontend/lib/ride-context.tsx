"use client";

import React, { createContext, useContext, useState } from "react";

// ==============================
// 🔹 Interfaces
// ==============================
export interface Offer {
  id: string;
  type: "time" | "distance";
  name: string;
  description: string;
  price: number;
  duration?: number; // in minutes for time-based
  distance?: number; // in km for distance-based
  icon: string;
}

export interface RideSession {
  _id: string;
  userId: string;
  bikeId: string;
  startStation: string;
  endStation?: string;
  startTime: string;
  endTime?: string;
  durationSec?: number;
  price?: number;
  photoBeforeId?: string;
  photoAfterId?: string;
  aiStatus?: string;
  gpsPath: { lat: number; lng: number }[]; // obligatoire pour éviter les erreurs
}

// ==============================
// 🔹 Contexte
// ==============================
interface RideContextType {
  currentRide: RideSession | null;
  selectedOffer: Offer | null;
  offers: Offer[];
  startRide: (
    stationId: string,
    offerId: string,
    startLocation?: { lat: number; lng: number }
  ) => void;
  endRide: () => void;
  setSelectedOffer: (offer: Offer) => void;
  updateGPSPath: (location: { lat: number; lng: number }) => void;
  setPhotoCaptured: (captured: boolean) => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

// ==============================
// 🔹 Offres par défaut
// ==============================
const DEFAULT_OFFERS: Offer[] = [
  {
    id: "1",
    type: "time",
    name: "30 Min Ride",
    description: "Perfect for short trips",
    price: 2.99,
    duration: 30,
    icon: "⏱️",
  },
  {
    id: "2",
    type: "time",
    name: "1 Hour Ride",
    description: "Great for exploring",
    price: 5.99,
    duration: 60,
    icon: "⏱️",
  },
  {
    id: "3",
    type: "distance",
    name: "Distance Pass",
    description: "Pay per kilometer",
    price: 0.5,
    distance: 1,
    icon: "📍",
  },
  {
    id: "4",
    type: "time",
    name: "Unlimited Day Pass",
    description: "Unlimited rides for 24h",
    price: 19.99,
    duration: 1440,
    icon: "🌅",
  },
];

// ==============================
// 🔹 Provider principal
// ==============================
export function RideProvider({ children }: { children: React.ReactNode }) {
  const [currentRide, setCurrentRide] = useState<RideSession | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [offers] = useState(DEFAULT_OFFERS);

  // 🔹 Démarrer un ride
  const startRide = (
    stationId: string,
    offerId: string,
    startLocation?: { lat: number; lng: number }
  ) => {
    const ride: RideSession = {
      _id: `ride_${Date.now()}`,
      userId: `user_${Date.now()}`, // temporaire, remplacer par user connecté
      bikeId: `bike_${Math.random().toString(36).substr(2, 9)}`,
      startStation: stationId,
      startTime: new Date().toISOString(),
      gpsPath: startLocation ? [startLocation] : [], // initialise gpsPath
    };
    setCurrentRide(ride);
    setSelectedOffer(offers.find((o) => o.id === offerId) || null);
  };

  // 🔹 Terminer un ride
  const endRide = () => {
    setCurrentRide(null);
    setSelectedOffer(null);
  };

  // 🔹 Mise à jour du GPS
  const updateGPSPath = (location: { lat: number; lng: number }) => {
    setCurrentRide((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        gpsPath: [...(prev.gpsPath || []), location],
      };
    });
  };

  // 🔹 Photo capturée
  const setPhotoCaptured = (captured: boolean) => {
    setCurrentRide((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        photoAfterId: captured ? `photo_${Date.now()}` : undefined,
      };
    });
  };

  return (
    <RideContext.Provider
      value={{
        currentRide,
        selectedOffer,
        offers,
        startRide,
        endRide,
        setSelectedOffer,
        updateGPSPath,
        setPhotoCaptured,
      }}
    >
      {children}
    </RideContext.Provider>
  );
}

// 🔹 Hook personnalisé
export function useRide() {
  const context = useContext(RideContext);
  if (!context) throw new Error("useRide must be used within a RideProvider");
  return context;
}
