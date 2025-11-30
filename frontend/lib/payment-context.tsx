"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface PaymentMethod {
  id: string
  type: "card" | "wallet" | "paypal"
  name: string
  lastFour?: string
  isDefault: boolean
}

export interface Transaction {
  id: string
  userId: string
  rideId: string
  amount: number
  type: "ride_charge" | "wallet_topup" | "refund"
  status: "completed" | "pending" | "failed"
  paymentMethod: string
  timestamp: number
  description: string
}

export interface Wallet {
  userId: string
  balance: number
  totalSpent: number
  totalTopups: number
}

interface PaymentContextType {
  wallet: Wallet | null
  transactions: Transaction[]
  paymentMethods: PaymentMethod[]
  isLoading: boolean
  addPaymentMethod: (method: PaymentMethod) => void
  removePaymentMethod: (id: string) => void
  setDefaultPaymentMethod: (id: string) => void
  topupWallet: (amount: number, paymentMethodId: string) => Promise<void>
  chargeRide: (rideId: string, amount: number, paymentMethodId: string) => Promise<void>
  getTransactionHistory: () => Transaction[]
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize payment data from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem("user_wallet")
    const savedTransactions = localStorage.getItem("transactions_history")
    const savedMethods = localStorage.getItem("payment_methods")

    if (savedWallet) {
      setWallet(JSON.parse(savedWallet))
    } else {
      setWallet({
        userId: "current_user",
        balance: 50.0,
        totalSpent: 0,
        totalTopups: 0,
      })
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }

    if (savedMethods) {
      setPaymentMethods(JSON.parse(savedMethods))
    } else {
      setPaymentMethods([
        {
          id: "card_1",
          type: "card",
          name: "Visa",
          lastFour: "4242",
          isDefault: true,
        },
      ])
    }

    setIsLoading(false)
  }, [])

  const addPaymentMethod = (method: PaymentMethod) => {
    const updated = [...paymentMethods, method]
    setPaymentMethods(updated)
    localStorage.setItem("payment_methods", JSON.stringify(updated))
  }

  const removePaymentMethod = (id: string) => {
    const updated = paymentMethods.filter((m) => m.id !== id)
    setPaymentMethods(updated)
    localStorage.setItem("payment_methods", JSON.stringify(updated))
  }

  const setDefaultPaymentMethod = (id: string) => {
    const updated = paymentMethods.map((m) => ({
      ...m,
      isDefault: m.id === id,
    }))
    setPaymentMethods(updated)
    localStorage.setItem("payment_methods", JSON.stringify(updated))
  }

  const topupWallet = async (amount: number, paymentMethodId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (wallet) {
          const newWallet = {
            ...wallet,
            balance: wallet.balance + amount,
            totalTopups: wallet.totalTopups + 1,
          }
          setWallet(newWallet)
          localStorage.setItem("user_wallet", JSON.stringify(newWallet))

          const transaction: Transaction = {
            id: `txn_${Date.now()}`,
            userId: wallet.userId,
            rideId: "",
            amount,
            type: "wallet_topup",
            status: "completed",
            paymentMethod: paymentMethodId,
            timestamp: Date.now(),
            description: `Wallet top-up of $${amount.toFixed(2)}`,
          }

          const updated = [transaction, ...transactions]
          setTransactions(updated)
          localStorage.setItem("transactions_history", JSON.stringify(updated))
        }
        resolve()
      }, 1000)
    })
  }

  const chargeRide = async (rideId: string, amount: number, paymentMethodId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (wallet) {
          const newWallet = {
            ...wallet,
            balance: Math.max(0, wallet.balance - amount),
            totalSpent: wallet.totalSpent + amount,
          }
          setWallet(newWallet)
          localStorage.setItem("user_wallet", JSON.stringify(newWallet))

          const transaction: Transaction = {
            id: `txn_${Date.now()}`,
            userId: wallet.userId,
            rideId,
            amount,
            type: "ride_charge",
            status: "completed",
            paymentMethod: paymentMethodId,
            timestamp: Date.now(),
            description: `Ride charge for ${rideId}`,
          }

          const updated = [transaction, ...transactions]
          setTransactions(updated)
          localStorage.setItem("transactions_history", JSON.stringify(updated))
        }
        resolve()
      }, 800)
    })
  }

  const getTransactionHistory = () => transactions

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
  )
}

export function usePayment() {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider")
  }
  return context
}
