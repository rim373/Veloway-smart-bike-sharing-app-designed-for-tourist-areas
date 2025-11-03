"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("auth_user")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      // Simulate API call to Jakarta backend
      const response = await new Promise<{ token: string; user: User }>((resolve) => {
        setTimeout(() => {
          resolve({
            token: `jwt_token_${Date.now()}`,
            user: {
              id: `user_${Date.now()}`,
              email,
              name: email.split("@")[0],
            },
          })
        }, 800)
      })

      setToken(response.token)
      setUser(response.user)
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("auth_user", JSON.stringify(response.user))
    } catch (error) {
      throw new Error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      // Simulate API call to Jakarta backend
      const response = await new Promise<{ token: string; user: User }>((resolve) => {
        setTimeout(() => {
          resolve({
            token: `jwt_token_${Date.now()}`,
            user: {
              id: `user_${Date.now()}`,
              email,
              name,
            },
          })
        }, 800)
      })

      setToken(response.token)
      setUser(response.user)
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("auth_user", JSON.stringify(response.user))
    } catch (error) {
      throw new Error("Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
