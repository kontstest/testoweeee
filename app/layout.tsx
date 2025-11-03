import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "sonner"
import { CookieConsent } from "@/components/cookie-consent"

export const metadata: Metadata = {
  title: "EventFlow - Wedding & Event Management",
  description: "Create beautiful, interactive event experiences for your guests",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster position="top-center" richColors />
        <CookieConsent />
      </body>
    </html>
  )
}
