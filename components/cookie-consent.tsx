"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { X } from "lucide-react"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowBanner(false)
  }

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom">
      <Card className="max-w-4xl mx-auto p-6 shadow-lg border-2">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">🍪 Używamy ciasteczek</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ta strona używa plików cookie aby zapewnić najlepsze doświadczenie użytkownika. Używamy tylko niezbędnych
              ciasteczek do funkcjonowania aplikacji (sesje, uwierzytelnianie). Nie śledzimy Twojej aktywności ani nie
              udostępniamy danych osobowych stronom trzecim.{" "}
              <Link href="/privacy-policy" className="underline hover:text-primary">
                Polityka prywatności
              </Link>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={acceptCookies} size="sm">
                Akceptuję
              </Button>
              <Button onClick={declineCookies} variant="outline" size="sm">
                Odrzuć
              </Button>
              <Link href="/privacy-policy">
                <Button variant="ghost" size="sm">
                  Dowiedz się więcej
                </Button>
              </Link>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={declineCookies} className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
