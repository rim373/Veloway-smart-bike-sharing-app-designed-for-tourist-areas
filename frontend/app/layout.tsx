import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import Navigation from "@/components/navigation"
import { AuthProvider } from "@/lib/auth-context"
import { MapProvider } from "@/lib/map-context"
import { RideProvider } from "@/lib/ride-context"
import { RideHistoryProvider } from "@/lib/ride-history-context"
import { PaymentProvider } from "@/lib/payment-context"
import { NotificationsProvider } from "@/lib/notifications-context"
import "./globals.css"

// ✅ Replace Geist with Inter or any Google Font you like
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Veloway - Bike Rental",
  description: "Modern bike rental app with real-time tracking",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Veloway",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                  .catch(err => console.error('SW registration failed:', err))
              })
            }
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <MapProvider>
            <RideProvider>
              <RideHistoryProvider>
                <PaymentProvider>
                  <NotificationsProvider>
                    <Navigation />
                    {children}
                    <Analytics />
                  </NotificationsProvider>
                </PaymentProvider>
              </RideHistoryProvider>
            </RideProvider>
          </MapProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
