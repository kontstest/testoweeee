"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Event } from "@/lib/types/database"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

interface TemplateSelectorTabProps {
  event: Event
  onUpdate: () => void
}

const templates = [
  {
    id: "classic",
    name: "Klasyczny",
    description: "Elegancka klasyka z zaokrągleniami",
    colors: { bg: "from-pink-50 to-purple-50", accent: "bg-pink-600" },
  },
  {
    id: "elegant",
    name: "Elegancki",
    description: "Minimalistyczny elegancki styl",
    colors: { bg: "from-slate-50 to-neutral-50", accent: "bg-slate-900" },
  },
  {
    id: "colorful",
    name: "Kolorowy",
    description: "Żywy, pełny życia i barw",
    colors: { bg: "from-yellow-50 via-orange-50 to-red-50", accent: "bg-orange-500" },
  },
  {
    id: "minimal",
    name: "Minimalistyczny",
    description: "Prosty, czysty i nowoczesny",
    colors: { bg: "from-white to-gray-50", accent: "bg-gray-800" },
  },
]

export function TemplateSelectorTab({ event, onUpdate }: TemplateSelectorTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(event.guest_template || "classic")
  const [showHeroImage, setShowHeroImage] = useState(event.show_hero_image !== false)
  const [showBackgroundImage, setShowBackgroundImage] = useState(event.show_background_image !== false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSelectTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_template: templateId }),
      })

      if (!res.ok) throw new Error("Failed to change template")

      toast.success("Szablon zmieniony pomyślnie!")
      onUpdate()
    } catch (error) {
      console.error("[v0] Error changing template:", error)
      toast.error("Błąd podczas zmiany szablonu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleHeroImage = async () => {
    const newValue = !showHeroImage
    setShowHeroImage(newValue)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show_hero_image: newValue }),
      })

      if (!res.ok) throw new Error("Failed to toggle hero image")

      toast.success(newValue ? "Zdjęcie hero włączone" : "Zdjęcie hero wyłączone")
      onUpdate()
    } catch (error) {
      console.error("[v0] Error toggling hero image:", error)
      toast.error("Błąd podczas zmiany ustawienia")
      setShowHeroImage(!newValue)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleBackgroundImage = async () => {
    const newValue = !showBackgroundImage
    setShowBackgroundImage(newValue)
    setIsLoading(true)

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show_background_image: newValue }),
      })

      if (!res.ok) throw new Error("Failed to toggle background image")

      toast.success(newValue ? "Tło w tle włączone" : "Tło w tle wyłączone")
      onUpdate()
    } catch (error) {
      console.error("[v0] Error toggling background image:", error)
      toast.error("Błąd podczas zmiany ustawienia")
      setShowBackgroundImage(!newValue)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate)

  return (
    <div className="grid lg:grid-cols-2 gap-8 overflow-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Dostępne Szablony</h3>
          <div className="space-y-3">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    disabled={isLoading}
                  >
                    {selectedTemplate === template.id ? "✓ Wybrany" : "Wybierz"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ustawienia Obrazów</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Zdjęcie Hero</p>
                <p className="text-xs text-gray-600">Główne zdjęcie na szablonie</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleHeroImage}
                disabled={isLoading}
                className={showHeroImage ? "bg-green-50" : "bg-red-50"}
              >
                {showHeroImage ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    ON
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    OFF
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Tło w Tle</p>
                <p className="text-xs text-gray-600">Zdjęcie tła za kartą</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleBackgroundImage}
                disabled={isLoading}
                className={showBackgroundImage ? "bg-green-50" : "bg-red-50"}
              >
                {showBackgroundImage ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    ON
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    OFF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Podgląd Szablonu</h3>
          <div
            className={`relative border-2 border-border rounded-xl bg-gradient-to-br ${selectedTemplateData?.colors.bg || "from-gray-50 to-white"} shadow-lg overflow-auto h-[90vh] p-6 flex flex-col items-center justify-center`}
          >
            <div className="text-center space-y-4 max-w-md">
              <div
                className={`w-20 h-20 ${selectedTemplateData?.colors.accent || "bg-gray-400"} rounded-lg mx-auto opacity-80`}
              ></div>
              <h3 className="text-2xl font-bold text-gray-900">{selectedTemplateData?.name}</h3>
              <p className="text-gray-600">{selectedTemplateData?.description}</p>
              <p className="text-sm text-gray-500">Podgląd szablonu wyświetli się na stronie gościa</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
