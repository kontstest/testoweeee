"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { Download, Upload, Palette } from "lucide-react"
import type { Event } from "@/lib/types/database"
import { generateEventQRCodeUrl } from "@/lib/utils/qr-code"

interface QRTemplateGeneratorProps {
  event: Event
}

type TemplateStyle = "boho" | "rustic" | "glamour" | "classic" | "minimalist"

export function QRTemplateGenerator({ event }: QRTemplateGeneratorProps) {
  const [style, setStyle] = useState<TemplateStyle>("classic")
  const [primaryColor, setPrimaryColor] = useState(event.secondary_color || "#ec4899")
  const [secondaryColor, setSecondaryColor] = useState(event.primary_color || "#9333ea")
  const [customText, setCustomText] = useState(`Zeskanuj kod QR\naby zobaczyć szczegóły\ni podzielić się zdjęciami`)
  const [decorImage, setDecorImage] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleDecorImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setDecorImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const generateTemplate = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // A4 size at 300 DPI: 2480 x 3508 pixels
    // Folded in half: 2480 x 1754 pixels per side
    canvas.width = 2480
    canvas.height = 3508

    // Clear canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw both sides (same content)
    drawSide(ctx, 0, style, primaryColor, secondaryColor, customText, decorImage)
    drawSide(ctx, 1754, style, primaryColor, secondaryColor, customText, decorImage)
  }

  const drawSide = (
    ctx: CanvasRenderingContext2D,
    yOffset: number,
    style: TemplateStyle,
    primary: string,
    secondary: string,
    text: string,
    decorImg: string | null,
  ) => {
    const centerX = 1240
    const centerY = yOffset + 877

    // Style-specific backgrounds and decorations
    switch (style) {
      case "boho":
        drawBohoStyle(ctx, centerX, centerY, primary, secondary)
        break
      case "rustic":
        drawRusticStyle(ctx, centerX, centerY, primary, secondary)
        break
      case "glamour":
        drawGlamourStyle(ctx, centerX, centerY, primary, secondary)
        break
      case "classic":
        drawClassicStyle(ctx, centerX, centerY, primary, secondary)
        break
      case "minimalist":
        drawMinimalistStyle(ctx, centerX, centerY, primary, secondary)
        break
    }

    // Draw event name
    ctx.fillStyle = primary
    ctx.font = "bold 120px serif"
    ctx.textAlign = "center"
    ctx.fillText(event.name, centerX, centerY - 600)

    // Draw date
    ctx.fillStyle = secondary
    ctx.font = "60px sans-serif"
    const dateStr = new Date(event.event_date).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    ctx.fillText(dateStr, centerX, centerY - 500)

    // Draw QR code placeholder (will be replaced with actual QR)
    const qrSize = 600
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(centerX - qrSize / 2, centerY - qrSize / 2, qrSize, qrSize)
    ctx.strokeStyle = primary
    ctx.lineWidth = 8
    ctx.strokeRect(centerX - qrSize / 2, centerY - qrSize / 2, qrSize, qrSize)

    // Draw QR code image
    const qrUrl = generateEventQRCodeUrl(event.id)
    if (qrUrl) {
      const qrImg = new Image()
      qrImg.crossOrigin = "anonymous"
      qrImg.onload = () => {
        ctx.drawImage(qrImg, centerX - qrSize / 2, centerY - qrSize / 2, qrSize, qrSize)
      }
      qrImg.src = qrUrl
    }

    // Draw custom text
    ctx.fillStyle = secondary
    ctx.font = "48px sans-serif"
    const lines = text.split("\n")
    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, centerY + 400 + i * 60)
    })

    // Draw decorative image if provided
    if (decorImg) {
      const img = new Image()
      img.onload = () => {
        const imgSize = 200
        ctx.drawImage(img, centerX - imgSize / 2, centerY + 600, imgSize, imgSize)
      }
      img.src = decorImg
    }
  }

  const drawBohoStyle = (ctx: CanvasRenderingContext2D, x: number, y: number, primary: string, secondary: string) => {
    // Feathers and leaves pattern
    ctx.strokeStyle = primary
    ctx.lineWidth = 4
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const x1 = x + Math.cos(angle) * 800
      const y1 = y + Math.sin(angle) * 800
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x1, y1)
      ctx.stroke()
    }
  }

  const drawRusticStyle = (ctx: CanvasRenderingContext2D, x: number, y: number, primary: string, secondary: string) => {
    // Wood texture effect with border
    ctx.strokeStyle = primary
    ctx.lineWidth = 20
    ctx.strokeRect(100, y - 800, 2280, 1600)

    // Corner decorations
    const cornerSize = 150
    ctx.fillStyle = secondary
    ctx.fillRect(100, y - 800, cornerSize, cornerSize)
    ctx.fillRect(2380 - cornerSize, y - 800, cornerSize, cornerSize)
    ctx.fillRect(100, y + 800 - cornerSize, cornerSize, cornerSize)
    ctx.fillRect(2380 - cornerSize, y + 800 - cornerSize, cornerSize, cornerSize)
  }

  const drawGlamourStyle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    primary: string,
    secondary: string,
  ) => {
    // Gold/glitter effect with elegant borders
    const gradient = ctx.createLinearGradient(0, y - 800, 0, y + 800)
    gradient.addColorStop(0, `${primary}20`)
    gradient.addColorStop(0.5, `${secondary}10`)
    gradient.addColorStop(1, `${primary}20`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, y - 877, 2480, 1754)

    // Elegant frame
    ctx.strokeStyle = primary
    ctx.lineWidth = 12
    ctx.strokeRect(150, y - 750, 2180, 1500)
    ctx.strokeRect(180, y - 720, 2120, 1440)
  }

  const drawClassicStyle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    primary: string,
    secondary: string,
  ) => {
    // Simple elegant border
    ctx.strokeStyle = primary
    ctx.lineWidth = 15
    ctx.strokeRect(200, y - 700, 2080, 1400)

    // Decorative corners
    ctx.fillStyle = secondary
    const cornerDots = [
      [200, y - 700],
      [2280, y - 700],
      [200, y + 700],
      [2280, y + 700],
    ]
    cornerDots.forEach(([cx, cy]) => {
      ctx.beginPath()
      ctx.arc(cx, cy, 30, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  const drawMinimalistStyle = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    primary: string,
    secondary: string,
  ) => {
    // Clean lines
    ctx.strokeStyle = primary
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(400, y - 650)
    ctx.lineTo(2080, y - 650)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(400, y + 650)
    ctx.lineTo(2080, y + 650)
    ctx.stroke()
  }

  const downloadTemplate = () => {
    generateTemplate()
    setTimeout(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `qr-template-${event.name.replace(/\s+/g, "-")}.png`
        a.click()
        URL.revokeObjectURL(url)
      })
    }, 1000) // Wait for QR code to load
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Wybierz Styl</h3>
            <RadioGroup value={style} onValueChange={(v) => setStyle(v as TemplateStyle)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="boho" id="boho" />
                  <Label htmlFor="boho" className="cursor-pointer">
                    Boho - Naturalne, swobodne wzory z piórami i liśćmi
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rustic" id="rustic" />
                  <Label htmlFor="rustic" className="cursor-pointer">
                    Rustykalny - Drewniane tekstury i proste ozdoby
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="glamour" id="glamour" />
                  <Label htmlFor="glamour" className="cursor-pointer">
                    Glamour - Eleganckie, złote akcenty i gradienty
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classic" id="classic" />
                  <Label htmlFor="classic" className="cursor-pointer">
                    Klasyczny - Tradycyjne ramki i ozdoby
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimalist" id="minimalist" />
                  <Label htmlFor="minimalist" className="cursor-pointer">
                    Minimalistyczny - Czyste linie, nowoczesny design
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Kolory
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="primaryColor">Kolor Główny</Label>
                <div className="flex gap-2 mt-2">
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
                    placeholder="#ec4899"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryColor">Kolor Akcentu</Label>
                <div className="flex gap-2 mt-2">
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
                    placeholder="#9333ea"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tekst Informacyjny</h3>
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={4}
              placeholder="Dodaj własny tekst..."
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Zdjęcie Dekoracyjne (Opcjonalne)
            </h3>
            <Input type="file" accept="image/*" onChange={handleDecorImageUpload} />
            {decorImage && (
              <div className="mt-4">
                <img
                  src={decorImage || "/placeholder.svg"}
                  alt="Decoration"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </Card>

          <Button onClick={downloadTemplate} className="w-full" size="lg">
            <Download className="w-5 h-5 mr-2" />
            Pobierz Szablon (A4)
          </Button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Podgląd</h3>
          <div className="border-4 border-border rounded-lg overflow-hidden bg-white shadow-xl">
            <div className="aspect-[210/297] relative">
              <canvas ref={canvasRef} className="w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Kliknij "Pobierz Szablon" aby wygenerować</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Format A4 (210mm x 297mm) składany na pół. Ten sam design z obu stron.
          </p>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
