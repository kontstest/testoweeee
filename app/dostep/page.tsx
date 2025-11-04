"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useLanguage } from "@/lib/hooks/use-language"

export default function AccessCodePage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { language } = useLanguage()

  const translations = {
    pl: {
      title: "Wejdź na Wydarzenie",
      description: "Jeśli nie możesz zeskanować kod QR, wpisz kod dostępu poniżej",
      codeLabel: "Kod dostępu",
      codePlaceholder: "np. ABC123XY",
      submitButton: "Wejdź",
      invalidCode: "Kod dostępu jest nieprawidłowy lub wygasł",
      enterCode: "Proszę wpisz kod dostępu",
      loading: "Sprawdzanie kodu...",
      backToQR: "Lub zeskanuj kod QR",
    },
    en: {
      title: "Access Event",
      description: "If you can't scan the QR code, enter the access code below",
      codeLabel: "Access Code",
      codePlaceholder: "e.g. ABC123XY",
      submitButton: "Enter",
      invalidCode: "The access code is invalid or expired",
      enterCode: "Please enter an access code",
      loading: "Checking code...",
      backToQR: "Or scan the QR code",
    },
  }

  const t = translations[language] || translations.pl

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      toast.error(t.enterCode)
      return
    }

    setLoading(true)

    try {
      const { data: event, error } = await supabase
        .from("events")
        .select("id, status")
        .eq("access_code", code.toUpperCase())
        .eq("status", "active")
        .single()

      if (error || !event) {
        toast.error(t.invalidCode)
        setLoading(false)
        return
      }

      toast.success("Dostęp przyznany!")
      router.push(`/event/${event.id}`)
    } catch (err) {
      console.error("[v0] Error:", err)
      toast.error(t.invalidCode)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{t.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.codeLabel}</label>
              <Input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={t.codePlaceholder}
                maxLength={8}
                className="text-center text-lg tracking-widest font-mono"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? t.loading : t.submitButton}
            </Button>
          </form>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center">{t.backToQR}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
