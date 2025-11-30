"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/theme-toggle"
import NotificationsPanel from "@/components/notifications-panel"
import { useAuth } from "@/lib/auth-context"

export default function Navigation() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <nav className="border-b border-border bg-card z-40">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-primary">
          BikeHub
        </Link>

        <div className="flex gap-2 items-center">
          {user && <NotificationsPanel />}
          <ThemeToggle />

          {user ? (
            <>
              <div className="hidden sm:block text-sm text-muted-foreground pt-2">{user.name}</div>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
