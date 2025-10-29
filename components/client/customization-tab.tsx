"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types/database"
import { Upload, MoveHorizontal, MoveVertical, ImageIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { GuestEventPage } from "@/components/guest/guest-event-page"

interface CustomizationTabProps {
  event: Event
  onUpdate: () => void
}

export function CustomizationTab({ event, onUpdate }: CustomizationTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [primaryColor, setPrimaryColor] = useState(event.primary_color)
  const [secondaryColor, setSecondaryColor] = useState(event.secondary_color)
  const [contentBackgroundColor, setContentBackgroundColor] = useState(event.content_background_color || "#ffffff")
  const [heroImage, setHeroImage] = useState<File | null>(null)
  const [heroImagePreview, setHeroImagePreview] = useState(event.hero_image_url)
  const [heroPositionX, setHeroPositionX] = useState(() => {
    const position = event.hero_image_position || "center center"
    const [x] = position.split(" ")
    return x === "left" ? 0 : x === "right" ? 100 : 50
  })
  const [heroPositionY, setHeroPositionY] = useState(() => {
    const position = event.hero_image_position || "center center"
    const [, y] = position.split(" ")
    return y === "top" ? 0 : y === "bottom" ? 100 : 50
  })

  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [backgroundImagePreview, setBackgroundImagePreview] = useState(event.background_image_url)
  const [backgroundBlur, setBackgroundBlur] = useState(event.background_blur || 40)
  const [backgroundOpacity, setBackgroundOpacity] = useState(event.background_opacity || 30)
  const [backgroundBrightness, setBackgroundBrightness] = useState(event.background_brightness || 100)
  const [backgroundPositionX, setBackgroundPositionX] = useState(() => {
    const position = event.background_position || "center center"
    const [x] = position.split(" ")
    return x === "left" ? 0 : x === "right" ? 100 : 50
  })
  const [backgroundPositionY, setBackgroundPositionY] = useState(() => {
    const position = event.background_position || "center center"
    const [, y] = position.split(" ")
    return y === "top" ? 0 : y === "bottom" ? 100 : 50
  })

  const supabase = createClient()

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setHeroImage(file)
      setHeroImagePreview(URL.createObjectURL(file))
    }
  }

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBackgroundImage(file)
      setBackgroundImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      let heroImageUrl = event.hero_image_url
      let backgroundImageUrl = event.background_image_url

      // Upload hero image if changed
      if (heroImage) {
        const fileExt = heroImage.name.split(".").pop()
        const fileName = `${event.id}-hero-${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(fileName, heroImage)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-images").getPublicUrl(fileName)

        heroImageUrl = publicUrl
      }

      if (backgroundImage) {
        const fileExt = backgroundImage.name.split(".").pop()
        const fileName = `${event.id}-background-${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(fileName, backgroundImage)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-images").getPublicUrl(fileName)

        backgroundImageUrl = publicUrl
      }

      const heroPosition = `${heroPositionX}% ${heroPositionY}%`
      const backgroundPosition = `${backgroundPositionX}% ${backgroundPositionY}%`

      // Update event
      const { error } = await supabase
        .from("events")
        .update({
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          content_background_color: contentBackgroundColor,
          hero_image_url: heroImageUrl,
          hero_image_position: heroPosition,
          background_image_url: backgroundImageUrl,
          background_blur: backgroundBlur,
          background_opacity: backgroundOpacity,
          background_brightness: backgroundBrightness,
          background_position: backgroundPosition,
        })
        .eq("id", event.id)

      if (error) throw error

      onUpdate()
      alert("Customization saved successfully!")
    } catch (error) {
      console.error("[v0] Error saving customization:", error)
      alert("Failed to save customization")
    } finally {
      setIsLoading(false)
    }
  }

  const previewEvent: Event = {
    ...event,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    content_background_color: contentBackgroundColor,
    hero_image_url: heroImagePreview,
    hero_image_position: `${heroPositionX}% ${heroPositionY}%`,
    background_image_url: backgroundImagePreview,
    background_blur: backgroundBlur,
    background_opacity: backgroundOpacity,
    background_brightness: backgroundBrightness,
    background_position: `${backgroundPositionX}% ${backgroundPositionY}%`,
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Column - Settings */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Kolory</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Kolor Główny (Primary)</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#9333ea"
                />
              </div>
              <p className="text-sm text-muted-foreground">Używany dla głównego contentu i tła</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Kolor Akcentu (Secondary)</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#ec4899"
                />
              </div>
              <p className="text-sm text-muted-foreground">Używany dla ramek, przycisków i tekstu</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentBackgroundColor">Kolor Tła Contentu</Label>
              <div className="flex gap-2">
                <Input
                  id="contentBackgroundColor"
                  type="color"
                  value={contentBackgroundColor}
                  onChange={(e) => setContentBackgroundColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={contentBackgroundColor}
                  onChange={(e) => setContentBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Kolor tła głównego kontenera (bg-white/95 backdrop-blur-sm)
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Zdjęcie Hero (Gothic Arch)</h3>
          <div className="space-y-4">
            {heroImagePreview && (
              <div className="space-y-4">
                <img
                  src={heroImagePreview || "/placeholder.svg"}
                  alt="Hero preview"
                  className="w-full h-48 object-cover rounded-lg border-2 border-border"
                  style={{
                    objectPosition: `${heroPositionX}% ${heroPositionY}%`,
                  }}
                />

                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <MoveHorizontal className="w-4 h-4" />
                      Pozycja X: {heroPositionX}%
                    </Label>
                    <Slider
                      value={[heroPositionX]}
                      onValueChange={([value]) => setHeroPositionX(value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <MoveVertical className="w-4 h-4" />
                      Pozycja Y: {heroPositionY}%
                    </Label>
                    <Slider
                      value={[heroPositionY]}
                      onValueChange={([value]) => setHeroPositionY(value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Input id="heroImage" type="file" accept="image/*" onChange={handleHeroImageChange} className="hidden" />
              <Button variant="outline" onClick={() => document.getElementById("heroImage")?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {heroImagePreview ? "Zmień Zdjęcie" : "Wgraj Zdjęcie"}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Zdjęcie Tła (Background)</h3>
          <div className="space-y-4">
            {backgroundImagePreview && (
              <div className="space-y-4">
                <div
                  className="w-full h-48 rounded-lg border-2 border-border relative overflow-hidden"
                  style={{
                    backgroundImage: `url(${backgroundImagePreview})`,
                    backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
                    backgroundSize: "cover",
                    filter: `blur(${backgroundBlur}px) brightness(${backgroundBrightness}%)`,
                    opacity: backgroundOpacity / 100,
                  }}
                />

                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-sm">Rozmycie: {backgroundBlur}px</Label>
                    <Slider
                      value={[backgroundBlur]}
                      onValueChange={([value]) => setBackgroundBlur(value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Przezroczystość: {backgroundOpacity}%</Label>
                    <Slider
                      value={[backgroundOpacity]}
                      onValueChange={([value]) => setBackgroundOpacity(value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Jasność: {backgroundBrightness}%</Label>
                    <Slider
                      value={[backgroundBrightness]}
                      onValueChange={([value]) => setBackgroundBrightness(value)}
                      min={0}
                      max={200}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <MoveHorizontal className="w-4 h-4" />
                      Pozycja X: {backgroundPositionX}%
                    </Label>
                    <Slider
                      value={[backgroundPositionX]}
                      onValueChange={([value]) => setBackgroundPositionX(value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm">
                      <MoveVertical className="w-4 h-4" />
                      Pozycja Y: {backgroundPositionY}%
                    </Label>
                    <Slider
                      value={[backgroundPositionY]}
                      onValueChange={([value]) => setBackgroundPositionY(value)}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Input
                id="backgroundImage"
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageChange}
                className="hidden"
              />
              <Button variant="outline" onClick={() => document.getElementById("backgroundImage")?.click()}>
                <ImageIcon className="w-4 h-4 mr-2" />
                {backgroundImagePreview ? "Zmień Tło" : "Wgraj Tło"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : "Zapisz Zmiany"}
          </Button>
        </div>
      </div>

      {/* Right Column - Live Preview */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Podgląd Na Żywo</h3>
            <span className="text-sm text-muted-foreground">Widok gościa</span>
          </div>
          <div className="border-4 border-border rounded-2xl overflow-hidden shadow-xl bg-white">
            <div className="transform scale-[0.35] origin-top-left w-[285%] h-[1200px] overflow-y-auto">
              <GuestEventPage event={previewEvent} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Zmiany są widoczne na żywo. Kliknij "Zapisz Zmiany" aby zastosować.
          </p>
        </div>
      </div>
    </div>
  )
}
