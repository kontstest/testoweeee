"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button-wedding"
import { createClient } from "@/lib/supabase/client"
import type { PhotoOverlay } from "@/lib/types/database"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { translations } from "@/lib/i18n/translations"
import { useLanguage } from "@/lib/hooks/use-language"

interface PhotoOverlayModuleProps {
  eventId: string
  primaryColor: string
}

export function PhotoOverlayModule({ eventId, primaryColor }: PhotoOverlayModuleProps) {
  const { language } = useLanguage()
  const [overlays, setOverlays] = useState<PhotoOverlay[]>([])
  const [selectedOverlay, setSelectedOverlay] = useState<PhotoOverlay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [textInputs, setTextInputs] = useState<{ [key: string]: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const supabase = createClient()
  const t = translations[language].modules.photoOverlay || {
    title: "Photo with Template",
    selectTemplate: "Select Template",
    uploadPhoto: "Upload Photo",
    addText: "Add Text",
    download: "Download",
    loading: "Loading...",
  }

  useEffect(() => {
    loadOverlays()
  }, [eventId, language])

  const loadOverlays = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from("photo_overlays")
      .select("*")
      .eq("event_id", eventId)
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (data) {
      setOverlays(data as PhotoOverlay[])
    }
    setIsLoading(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleTextChange = (positionId: string, value: string) => {
    setTextInputs({ ...textInputs, [positionId]: value })
  }

  const drawImageWithOverlay = () => {
    if (!canvasRef.current || !uploadedImage || !selectedOverlay) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw image
      ctx.drawImage(img, 0, 0)

      // Create SVG with overlay
      const svgBlob = new Blob([selectedOverlay.overlay_svg], { type: "image/svg+xml" })
      const url = URL.createObjectURL(svgBlob)
      const svgImg = new Image()
      svgImg.crossOrigin = "anonymous"

      svgImg.onload = () => {
        ctx.drawImage(svgImg, 0, 0)

        // Add custom text if provided
        if (selectedOverlay.text_positions && Object.keys(textInputs).length > 0) {
          selectedOverlay.text_positions.forEach((pos) => {
            const text = textInputs[pos.id] || pos.defaultText
            ctx.font = `${pos.fontSize}px Arial`
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.strokeStyle = "black"
            ctx.lineWidth = 2
            ctx.strokeText(text, pos.x, pos.y)
            ctx.fillText(text, pos.x, pos.y)
          })
        }

        URL.revokeObjectURL(url)
      }

      svgImg.src = url
    }

    img.src = uploadedImage
  }

  const downloadImage = () => {
    if (!canvasRef.current) return

    drawImageWithOverlay()

    setTimeout(() => {
      const link = document.createElement("a")
      link.href = canvasRef.current!.toDataURL("image/png")
      link.download = `photo-${new Date().getTime()}.png`
      link.click()
      toast.success("Photo downloaded!")
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t.loading}</p>
      </div>
    )
  }

  if (overlays.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t.title}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.title}</h2>

        {/* Template Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">{t.selectTemplate}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {overlays.map((overlay) => (
              <Card
                key={overlay.id}
                className={`cursor-pointer transition-all ${selectedOverlay?.id === overlay.id ? "ring-2" : ""}`}
                style={{
                  ringColor: selectedOverlay?.id === overlay.id ? primaryColor : undefined,
                }}
                onClick={() => {
                  setSelectedOverlay(overlay)
                  setTextInputs({})
                }}
              >
                <CardContent className="p-4 text-center">
                  <p className="font-semibold text-sm mb-1">{overlay.name}</p>
                  <p className="text-xs text-muted-foreground">{overlay.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3">{t.uploadPhoto}</h3>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors"
            style={{
              borderColor: primaryColor,
              backgroundColor: `${primaryColor}05`,
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Camera className="w-8 h-8 mx-auto mb-2" style={{ color: primaryColor }} />
            <p className="text-sm font-medium mb-1">{t.uploadPhoto}</p>
            <p className="text-xs text-muted-foreground">
              {uploadedImage ? "Photo selected" : "Click or tap to select photo"}
            </p>
          </div>
        </div>

        {/* Text Customization */}
        {selectedOverlay?.text_positions && uploadedImage && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">{t.addText}</h3>
            <div className="space-y-3">
              {selectedOverlay.text_positions.map((pos) => (
                <div key={pos.id}>
                  <label className="text-xs text-muted-foreground mb-1 block">{pos.defaultText}</label>
                  <input
                    type="text"
                    value={textInputs[pos.id] || pos.defaultText}
                    onChange={(e) => handleTextChange(pos.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    style={{ borderColor: `${primaryColor}30` }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {uploadedImage && (
          <div className="mb-6">
            <div className="relative w-full max-w-md mx-auto">
              <img src={uploadedImage || "/placeholder.svg"} alt="Preview" className="w-full rounded-lg" />
            </div>
          </div>
        )}

        {/* Canvas (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Download Button */}
        {uploadedImage && (
          <Button
            onClick={downloadImage}
            className="w-full rounded-2xl py-6 text-base transition-all hover:scale-105"
            style={{ backgroundColor: primaryColor, color: "white" }}
          >
            <Download className="w-4 h-4 mr-2" />
            {t.download}
          </Button>
        )}
      </div>
    </div>
  )
}

import { Camera } from "lucide-react"
