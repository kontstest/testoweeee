"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types/database"
import { Upload, MoveHorizontal, MoveVertical } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface CustomizationTabProps {
  event: Event
  onUpdate: () => void
}

export function CustomizationTab({ event, onUpdate }: CustomizationTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [primaryColor, setPrimaryColor] = useState(event.primary_color)
  const [secondaryColor, setSecondaryColor] = useState(event.secondary_color)
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
  const supabase = createClient()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setHeroImage(file)
      setHeroImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      let heroImageUrl = event.hero_image_url

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

      const heroPosition = `${heroPositionX}% ${heroPositionY}%`

      // Update event
      const { error } = await supabase
        .from("events")
        .update({
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          hero_image_url: heroImageUrl,
          hero_image_position: heroPosition,
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

  const accentColor = secondaryColor || primaryColor || "#9333ea"

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Colors</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
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
                placeholder="#8B5CF6"
              />
            </div>
            <p className="text-sm text-muted-foreground">Used for buttons and accents</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
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
                placeholder="#EC4899"
              />
            </div>
            <p className="text-sm text-muted-foreground">Used for highlights and secondary elements</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Hero Image</h3>
        <div className="space-y-4">
          {heroImagePreview && (
            <div className="space-y-4">
              <div className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-border">
                <div
                  className="absolute inset-0 bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: `url(${heroImagePreview})`,
                    backgroundPosition: `${heroPositionX}% ${heroPositionY}%`,
                    transform: "scale(1.2)",
                    filter: "blur(40px)",
                    opacity: 0.3,
                  }}
                />

                <div className="relative z-10 flex items-center justify-center h-full p-8">
                  <div
                    className="bg-white/95 backdrop-blur-sm rounded-[3rem] p-6 max-w-md w-full shadow-2xl"
                    style={{
                      outline: `4px solid ${accentColor}`,
                      outlineOffset: "8px",
                    }}
                  >
                    <div className="relative w-full aspect-[2/3]">
                      <div
                        className="absolute inset-0 overflow-hidden rounded-t-[10rem]"
                        style={{
                          outline: `4px solid ${accentColor}`,
                          outlineOffset: "6px",
                        }}
                      >
                        <img
                          src={heroImagePreview || "/placeholder.svg"}
                          alt="Hero preview"
                          className="w-full h-full object-cover rounded-t-[10rem]"
                          style={{
                            objectPosition: `${heroPositionX}% ${heroPositionY}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MoveHorizontal className="w-4 h-4" />
                    Horizontal Position: {heroPositionX}%
                  </Label>
                  <Slider
                    value={[heroPositionX]}
                    onValueChange={([value]) => setHeroPositionX(value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MoveVertical className="w-4 h-4" />
                    Vertical Position: {heroPositionY}%
                  </Label>
                  <Slider
                    value={[heroPositionY]}
                    onValueChange={([value]) => setHeroPositionY(value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  Adjust the position to frame your image perfectly in the hero section
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Input id="heroImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <Button variant="outline" onClick={() => document.getElementById("heroImage")?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {heroImagePreview ? "Change Image" : "Upload Image"}
            </Button>
            <p className="text-sm text-muted-foreground">Recommended: 1920x1080px or larger</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
