"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { Event } from "@/lib/types/database"
import { Save, Code, Sparkles } from "lucide-react"

interface AdvancedSettingsTabProps {
  event: Event
  onUpdate: () => void
}

export function AdvancedSettingsTab({ event, onUpdate }: AdvancedSettingsTabProps) {
  const [customCSS, setCustomCSS] = useState("")
  const [customJS, setCustomJS] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [event.id])

  const loadSettings = async () => {
    try {
      const res = await fetch(`/api/events/${event.id}`)
      if (res.ok) {
        const data = await res.json()
        setCustomCSS(data.custom_css || "")
        setCustomJS(data.custom_js || "")
      }
    } catch (error) {
      console.error("[v0] Error loading settings:", error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_css: customCSS,
          custom_js: customJS,
        }),
      })

      if (!res.ok) throw new Error("Failed to save")

      toast.success("Ustawienia zaawansowane zostały zapisane")
      onUpdate()
    } catch (error) {
      console.error("[v0] Error saving advanced settings:", error)
      toast.error("Nie udało się zapisać ustawień")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ustawienia zaawansowane</h2>
        <p className="text-muted-foreground">
          Dostosuj aplikację za pomocą własnego CSS i JavaScript. Zmiany będą widoczne na stronie gościa.
        </p>
      </div>

      {/* Custom CSS */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            <CardTitle>Custom CSS</CardTitle>
          </div>
          <CardDescription>
            Dodaj własne style CSS które będą zastosowane do strony gościa. Możesz nadpisać domyślne style lub dodać
            nowe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>CSS Code</Label>
            <Textarea
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
              placeholder="/* Przykład: */&#10;.guest-page {&#10;  font-family: 'Georgia', serif;&#10;}&#10;&#10;.hero-section {&#10;  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);&#10;}&#10;&#10;.module-card {&#10;  border-radius: 20px;&#10;  box-shadow: 0 10px 30px rgba(0,0,0,0.1);&#10;}"
              className="font-mono text-sm min-h-[300px]"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Przydatne klasy CSS:
            </h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                <code className="bg-white px-2 py-0.5 rounded">.guest-page</code> - główny kontener strony gościa
              </li>
              <li>
                <code className="bg-white px-2 py-0.5 rounded">.hero-section</code> - sekcja hero z gothic arch
              </li>
              <li>
                <code className="bg-white px-2 py-0.5 rounded">.module-card</code> - karty modułów (harmonogram, menu,
                etc.)
              </li>
              <li>
                <code className="bg-white px-2 py-0.5 rounded">.content-container</code> - główny kontener contentu
              </li>
              <li>
                <code className="bg-white px-2 py-0.5 rounded">.language-switcher</code> - przełącznik języka
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Custom JavaScript */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            <CardTitle>Custom JavaScript</CardTitle>
          </div>
          <CardDescription>
            Dodaj własny kod JavaScript dla zaawansowanych funkcjonalności. Kod będzie wykonany na stronie gościa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>JavaScript Code</Label>
            <Textarea
              value={customJS}
              onChange={(e) => setCustomJS(e.target.value)}
              placeholder="// Przykład:&#10;console.log('Custom JS loaded');&#10;&#10;// Dodaj animacje&#10;document.addEventListener('DOMContentLoaded', () => {&#10;  const cards = document.querySelectorAll('.module-card');&#10;  cards.forEach((card, index) => {&#10;    card.style.animationDelay = `${index * 0.1}s`;&#10;  });&#10;});"
              className="font-mono text-sm min-h-[300px]"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">⚠️ Uwaga:</h4>
            <p className="text-sm text-muted-foreground">
              Custom JavaScript może wpłynąć na działanie aplikacji. Upewnij się, że kod jest poprawny i nie powoduje
              błędów. Zalecamy testowanie zmian przed zapisaniem.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Future Features */}
      <Card>
        <CardHeader>
          <CardTitle>Przyszłe funkcje</CardTitle>
          <CardDescription>Funkcje które będą dostępne wkrótce</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Export/Import konfiguracji eventu (JSON)</li>
            <li>• Własne fonty (upload plików .woff, .woff2)</li>
            <li>• Animacje i przejścia (fade in, slide, bounce)</li>
            <li>• Conditional rendering (pokazuj/ukryj elementy na podstawie warunków)</li>
            <li>• A/B testing (testuj różne wersje strony)</li>
            <li>• Analytics i tracking (Google Analytics, Facebook Pixel)</li>
            <li>• Custom domains (własna domena dla strony gościa)</li>
            <li>• PWA support (aplikacja mobilna)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Zapisywanie..." : "Zapisz ustawienia"}
        </Button>
      </div>
    </div>
  )
}
