"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface PaymentMethod {
  _id: string;
  type: "card" | "wallet" | "paypal";
  name: string;
  lastFour?: string;
  isDefault: boolean;
}

export interface Transaction {
  _id: string;
  userId: string;
  rideId?: string;
  amount: number;
  type: "ride_charge" | "wallet_topup" | "refund";
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
  timestamp: number;
  description: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  totalSpent: number;
  totalTopups: number;
}

interface PaymentContextType {
  wallet: Wallet | null;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  topupWallet: (amount: number, paymentMethodId: string) => Promise<void>;
  chargeRide: (rideId: string, amount: number, paymentMethodId: string) => Promise<void>;
  getTransactionHistory: () => Transaction[];
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch initial data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 🔹 Récupère les transactions depuis MongoDB via l'API Next.js
        const res = await fetch("/api/payments");
        if (!res.ok) throw new Error("Erreur lors du fetch des paiements");
        const data: Transaction[] = await res.json();
        setTransactions(data);

        // 🔹 Initialise wallet et méthodes de paiement
        const userId = data.length > 0 ? data[0].userId : "current_user";
        const balance = 50; // valeur initiale par défaut
        setWallet({
          userId,
          balance,
          totalSpent: data.reduce((sum, t) => sum + (t.type === "ride_charge" ? t.amount : 0), 0),
          totalTopups: data.filter((t) => t.type === "wallet_topup").length,
        });

        setPaymentMethods([
          {
            _id: "card_1",
            type: "card",
            name: "Visa",
            lastFour: "4242",
            isDefault: true,
          },
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des paiements :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addPaymentMethod = (method: PaymentMethod) => {
    const updated = [...paymentMethods, method];
    setPaymentMethods(updated);
  };

  const removePaymentMethod = (id: string) => {
    const updated = paymentMethods.filter((m) => m._id !== id);
    setPaymentMethods(updated);
  };

  const setDefaultPaymentMethod = (id: string) => {
    const updated = paymentMethods.map((m) => ({
      ...m,
      isDefault: m._id === id,
    }));
    setPaymentMethods(updated);
  };

  const topupWallet = async (amount: number, paymentMethodId: string) => {
    if (!wallet) return;
    const newWallet = {
      ...wallet,
      balance: wallet.balance + amount,
      totalTopups: wallet.totalTopups + 1,
    };
    setWallet(newWallet);

    const transaction: Transaction = {
      _id: `txn_${Date.now()}`,
      userId: wallet.userId,
      amount,
      type: "wallet_topup",
      status: "completed",
      paymentMethod: paymentMethodId,
      timestamp: Date.now(),
      description: `Wallet top-up of $${amount.toFixed(2)}`,
    };

    setTransactions([transaction, ...transactions]);
  };

  const chargeRide = async (rideId: string, amount: number, paymentMethodId: string) => {
    if (!wallet) return;
    const newWallet = {
      ...wallet,
      balance: Math.max(0, wallet.balance - amount),
      totalSpent: wallet.totalSpent + amount,
    };
    setWallet(newWallet);

    const transaction: Transaction = {
      _id: `txn_${Date.now()}`,
      userId: wallet.userId,
      rideId,
      amount,
      type: "ride_charge",
      status: "completed",
      paymentMethod: paymentMethodId,
      timestamp: Date.now(),
      description: `Ride charge for ${rideId}`,
    };

    setTransactions([transaction, ...transactions]);
  };

  const getTransactionHistory = () => transactions;

  return (
    <PaymentContext.Provider
      value={{
        wallet,
        transactions,
        paymentMethods,
        isLoading,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultPaymentMethod,
        topupWallet,
        chargeRide,
        getTransactionHistory,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) throw new Error("usePayment must be used within a PaymentProvider");
  return context;
}
