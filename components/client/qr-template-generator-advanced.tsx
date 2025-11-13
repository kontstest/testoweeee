"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Save,
  Trash2,
  Type,
  QrCodeIcon,
  ImageIcon,
  RotateCw,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from "lucide-react"
import type { Event } from "@/lib/types/database"
// import { createClient } from "@/lib/supabase/client" // Removed Supabase client import
import { toast } from "sonner"
import QRCode from "qrcode"

interface QRTemplateGeneratorAdvancedProps {
  event: Event
}

interface TemplateElement {
  id: string
  type: "text" | "qrcode" | "image"
  x: number
  y: number
  scale: number
  size?: number
  width?: number
  height?: number
  content?: string
  fontSize?: number
  fontWeight?: number
  textAlign?: "left" | "center" | "right"
  color?: string
  backgroundColor?: string
  qrBackgroundColor?: string
  qrBackgroundTransparent?: boolean
  qrBackgroundImage?: string
  imageUrl?: string
  zIndex: number
  rotation: number
  flipHorizontal: boolean
  flipVertical: boolean
  opacity: number
}

interface Template {
  id?: string
  name: string
  background: string
  backgroundImage?: string
  backgroundX: number
  backgroundY: number
  backgroundScale: number
  elements: TemplateElement[]
  domainText: string
  domainColor: string
  domainFontSize: number
  customCSS?: string
}

const CANVAS_WIDTH = 595
const CANVAS_HEIGHT = 421

const predefinedTemplates: Omit<Template, "id">[] = [
  {
    name: "Elegancki",
    background: "#ffffff",
    backgroundX: 50,
    backgroundY: 50,
    backgroundScale: 100,
    elements: [
      {
        id: "qr1",
        type: "qrcode",
        x: 150,
        y: 50,
        scale: 100,
        size: 200,
        backgroundColor: "#000000",
        zIndex: 1000,
        qrBackgroundColor: "#ffffff",
        qrBackgroundTransparent: false,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        opacity: 100,
      },
      {
        id: "text1",
        type: "text",
        x: 150,
        y: 270,
        scale: 100,
        content: "Zeskanuj kod QR",
        fontSize: 24,
        color: "#000000",
        zIndex: 1,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        opacity: 100,
        fontWeight: 400,
        textAlign: "left",
      },
    ],
    domainText: "xyz.pl",
    domainColor: "#000000",
    domainFontSize: 14,
  },
  {
    name: "Kolorowy",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    backgroundX: 50,
    backgroundY: 50,
    backgroundScale: 100,
    elements: [
      {
        id: "qr1",
        type: "qrcode",
        x: 150,
        y: 40,
        scale: 100,
        size: 180,
        backgroundColor: "#ffffff",
        zIndex: 1000,
        qrBackgroundColor: "#ffffff",
        qrBackgroundTransparent: false,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        opacity: 100,
      },
      {
        id: "text1",
        type: "text",
        x: 150,
        y: 240,
        scale: 100,
        content: "Witamy!",
        fontSize: 32,
        color: "#ffffff",
        zIndex: 1,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        opacity: 100,
        fontWeight: 400,
        textAlign: "left",
      },
    ],
    domainText: "xyz.pl",
    domainColor: "#ffffff",
    domainFontSize: 14,
  },
  {
    name: "Minimalistyczny",
    background: "#f8f9fa",
    backgroundX: 50,
    backgroundY: 50,
    backgroundScale: 100,
    elements: [
      {
        id: "qr1",
        type: "qrcode",
        x: 200,
        y: 80,
        scale: 100,
        size: 150,
        backgroundColor: "#000000",
        zIndex: 1000,
        qrBackgroundColor: "#ffffff",
        qrBackgroundTransparent: false,
        rotation: 0,
        flipHorizontal: false,
        flipVertical: false,
        opacity: 100,
      },
    ],
    domainText: "xyz.pl",
    domainColor: "#212529",
    domainFontSize: 14,
  },
]

export function QRTemplateGeneratorAdvanced({ event }: QRTemplateGeneratorAdvancedProps) {
  const [template, setTemplate] = useState<Template>(predefinedTemplates[0])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [qrData, setQrData] = useState(`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/event/${event.id}`)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"general" | "style" | "transform" | "advanced">("general")
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([])
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const qrBackgroundInputRef = useRef<HTMLInputElement>(null)
  // const supabase = createClient() // Removed Supabase client initialization

  useEffect(() => {
    generateQRCode()
    loadSavedTemplates()
  }, [])

  useEffect(() => {
    generateQRCode()
  }, [template.elements])

  const generateQRCode = async () => {
    try {
      const qrElement = template.elements.find((el) => el.type === "qrcode")
      if (!qrElement) return

      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 800,
        margin: 1,
        color: {
          dark: qrElement.backgroundColor || "#000000",
          light: qrElement.qrBackgroundTransparent ? "#00000000" : qrElement.qrBackgroundColor || "#ffffff",
        },
      })
      setQrCodeDataUrl(qrDataUrl)
    } catch (err) {
      console.error("[v0] Error generating QR code:", err)
    }
  }

  const loadSavedTemplates = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/qr-templates`)
      const data = await response.json()
      setSavedTemplates(data)
    } catch (error) {
      console.error("[v0] Error loading templates:", error)
    }
  }

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTemplate({ ...template, backgroundImage: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newElement: TemplateElement = {
          id: `img-${Date.now()}`,
          type: "image",
          x: 100,
          y: 100,
          scale: 100,
          width: 100,
          height: 100,
          imageUrl: e.target?.result as string,
          zIndex: template.elements.length + 1,
          rotation: 0,
          flipHorizontal: false,
          flipVertical: false,
          opacity: 100,
        }
        setTemplate({ ...template, elements: [...template.elements, newElement] })
        setSelectedElement(newElement.id)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddElement = (type: "text" | "qrcode") => {
    if (type === "qrcode") {
      const hasQR = template.elements.some((el) => el.type === "qrcode")
      if (hasQR) {
        toast.error("Możesz mieć tylko jeden kod QR w szablonie!")
        return
      }
    }

    const newElement: TemplateElement =
      type === "text"
        ? {
            id: `el-${Date.now()}`,
            type: "text",
            x: 100,
            y: 100,
            scale: 100,
            zIndex: template.elements.length + 1,
            content: "Nowy tekst",
            fontSize: 20,
            color: "#000000",
            rotation: 0,
            flipHorizontal: false,
            flipVertical: false,
            opacity: 100,
            fontWeight: 400,
            textAlign: "left",
          }
        : {
            id: `el-${Date.now()}`,
            type: "qrcode",
            x: 100,
            y: 100,
            scale: 100,
            zIndex: 1000,
            size: 150,
            backgroundColor: "#000000",
            qrBackgroundColor: "#ffffff",
            qrBackgroundTransparent: false,
            rotation: 0,
            flipHorizontal: false,
            flipVertical: false,
            opacity: 100,
          }

    setTemplate({ ...template, elements: [...template.elements, newElement] })
    setSelectedElement(newElement.id)
  }

  const handleDeleteElement = () => {
    if (selectedElement) {
      setTemplate({
        ...template,
        elements: template.elements.filter((el) => el.id !== selectedElement),
      })
      setSelectedElement(null)
    }
  }

  const handleElementUpdate = (elementId: string, updates: Partial<TemplateElement>) => {
    setTemplate({
      ...template,
      elements: template.elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
    })
  }

  const alignElement = (alignment: string) => {
    if (!selectedElement) return
    const element = template.elements.find((el) => el.id === selectedElement)
    if (!element) return

    const elementWidth =
      element.type === "qrcode" ? element.size || 150 : element.type === "image" ? element.width || 100 : 100
    const elementHeight =
      element.type === "qrcode" ? element.size || 150 : element.type === "image" ? element.height || 100 : 30

    const updates: Partial<TemplateElement> = {}

    switch (alignment) {
      case "left":
        updates.x = 20
        break
      case "center":
        updates.x = (CANVAS_WIDTH - elementWidth) / 2
        break
      case "right":
        updates.x = CANVAS_WIDTH - elementWidth - 20
        break
      case "top":
        updates.y = 20
        break
      case "middle":
        updates.y = (CANVAS_HEIGHT - elementHeight) / 2
        break
      case "bottom":
        updates.y = CANVAS_HEIGHT - elementHeight - 40
        break
    }

    handleElementUpdate(selectedElement, updates)
  }

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    setDraggedElement(elementId)
    setSelectedElement(elementId)

    const element = template.elements.find((el) => el.id === elementId)
    if (element && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top
      setDragOffset({
        x: offsetX - element.x,
        y: offsetY - element.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedElement || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    handleElementUpdate(draggedElement, {
      x: Math.max(0, Math.min(CANVAS_WIDTH, newX)),
      y: Math.max(0, Math.min(CANVAS_HEIGHT, newY)),
    })
  }

  const handleMouseUp = () => {
    setDraggedElement(null)
  }

  const saveTemplate = async () => {
    const templateData = {
      event_id: event.id,
      name: template.name,
      style: "custom",
      primary_color: template.domainColor,
      secondary_color: template.domainColor,
      background_type: template.backgroundImage ? "image" : "color",
      background_value: template.backgroundImage || template.background,
      qr_background_color: template.elements.find((el) => el.type === "qrcode")?.qrBackgroundColor || "#ffffff",
      custom_text: template.domainText,
      decor_image: null,
      include_vendors: false,
      elements: template.elements,
      custom_css: template.customCSS,
    }

    try {
      const method = template.id ? "PUT" : "POST"
      const url = template.id
        ? `/api/events/${event.id}/qr-templates/${template.id}`
        : `/api/events/${event.id}/qr-templates`

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      })

      if (!response.ok) throw new Error("Failed to save")

      toast.success(template.id ? "Szablon został zaktualizowany" : "Szablon został zapisany")
      loadSavedTemplates()
    } catch (error) {
      toast.error("Nie udało się zapisać szablonu")
    }
  }

  const loadTemplate = (savedTemplate: Template) => {
    setTemplate(savedTemplate)
    setSelectedElement(null)
  }

  const deleteTemplate = async (id: string) => {
    toast.promise(
      (async () => {
        const response = await fetch(`/api/events/${event.id}/qr-templates/${id}`, { method: "DELETE" })
        if (!response.ok) throw new Error("Failed to delete")
        loadSavedTemplates()
        if (template.id === id) setTemplate(predefinedTemplates[0])
      })(),
      {
        loading: "Deleting template...",
        success: "Template deleted successfully!",
        error: "Failed to delete template",
      },
    )
  }

  const selectedElementData = template.elements.find((el) => el.id === selectedElement)

  const getTransform = (element: TemplateElement) => {
    const transforms = []
    if (element.scale !== 100) transforms.push(`scale(${element.scale / 100})`)
    if (element.rotation) transforms.push(`rotate(${element.rotation}deg)`)
    if (element.flipHorizontal) transforms.push("scaleX(-1)")
    if (element.flipVertical) transforms.push("scaleY(-1)")
    return transforms.join(" ")
  }

  const handleQRBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedElement) {
      const reader = new FileReader()
      reader.onload = (e) => {
        handleElementUpdate(selectedElement, { qrBackgroundImage: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      {template.customCSS && <style>{template.customCSS}</style>}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Sidebar - Settings */}
        <Card className="w-full lg:w-80 lg:flex-shrink-0">
          <CardHeader>
            <CardTitle>Generator Szablonów QR</CardTitle>
            <p className="text-sm text-muted-foreground">Format A4 składany na pół</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Wybierz szablon</Label>
              <div className="grid grid-cols-1 gap-2">
                {predefinedTemplates.map((t, idx) => (
                  <Button
                    key={idx}
                    variant={template.name === t.name ? "default" : "outline"}
                    onClick={() => setTemplate({ ...t })}
                    size="sm"
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL/Dane QR</Label>
              <Input value={qrData} onChange={(e) => setQrData(e.target.value)} placeholder="https://example.com" />
            </div>

            {event.access_code && (
              <div className="space-y-2">
                <Label>Kod dostępu dla gości</Label>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-muted-foreground mb-2">Wyświetl tego kodu na wydruku:</p>
                  <p className="text-2xl font-mono font-bold text-blue-600 text-center tracking-wider">
                    {event.access_code}
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-2">Gościa mogą wpisać go na /dostep</p>
                </div>
              </div>
            )}
            {/* dodam instrukcje z kodem na template */}
            <div className="space-y-2">
              <Label>Instrukcja dla gości</Label>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-900">Opcja 1: Zeskanuj kod QR</p>
                <p className="text-xs text-amber-700">Gościa skanujesz poniższy kod QR aby wejść na stronę eventu</p>
                <div className="bg-white p-2 rounded border border-amber-100 text-center">
                  {qrCodeDataUrl && (
                    <img
                      src={qrCodeDataUrl || "/placeholder.svg"}
                      alt="QR Code"
                      style={{ width: "100px", height: "100px", margin: "0 auto" }}
                    />
                  )}
                </div>
                {event.access_code && (
                  <>
                    <p className="text-xs font-semibold text-amber-900 mt-3">Opcja 2: Wpisz kod dostępu</p>
                    <p className="text-xs text-amber-700">Jeśli QR się nie skanuje, wejdź na:</p>
                    <p className="font-mono text-sm font-bold text-amber-600 text-center">/dostep</p>
                    <p className="text-xs text-amber-700">I wpisz kod:</p>
                    <p className="font-mono text-lg font-bold text-amber-600 text-center tracking-wider">
                      {event.access_code}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kolor tła szablonu</Label>
              <Input
                type="color"
                value={template.background.startsWith("#") ? template.background : "#ffffff"}
                onChange={(e) => setTemplate({ ...template, background: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Obraz tła (opcjonalnie)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundImageUpload}
                className="hidden"
              />
              <Button className="w-full bg-transparent" variant="outline" onClick={() => fileInputRef.current?.click()}>
                📤 Wgraj tło
              </Button>
              {template.backgroundImage && (
                <Button
                  className="w-full"
                  variant="destructive"
                  size="sm"
                  onClick={() => setTemplate({ ...template, backgroundImage: undefined })}
                >
                  🗑️ Usuń tło
                </Button>
              )}
            </div>

            <div className="border-t pt-4 space-y-2">
              <Label>Dodaj element</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAddElement("text")}>
                  <Type className="w-4 h-4 mr-1" />
                  Tekst
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddElement("qrcode")}>
                  <QrCodeIcon className="w-4 h-4 mr-1" />
                  QR Code
                </Button>
              </div>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <Button
                className="w-full bg-transparent"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Wgraj obraz
              </Button>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Label>Tekst domeny</Label>
              <Input
                value={template.domainText}
                onChange={(e) => setTemplate({ ...template, domainText: e.target.value })}
                placeholder="xyz.pl"
              />
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={template.domainColor}
                  onChange={(e) => setTemplate({ ...template, domainColor: e.target.value })}
                  className="w-20"
                />
                <Input
                  type="number"
                  value={template.domainFontSize}
                  onChange={(e) => setTemplate({ ...template, domainFontSize: Number.parseInt(e.target.value) })}
                  placeholder="14"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <Button className="w-full" onClick={saveTemplate}>
                <Save className="w-4 h-4 mr-2" />
                Zapisz szablon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Center - Canvas */}
        <div className="space-y-4 flex-1 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>Podgląd na żywo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* First page (Front) */}
              <div className="space-y-2">
                <div className="overflow-x-auto">
                  <div
                    ref={canvasRef}
                    className="relative border-2 border-dashed border-border rounded-lg overflow-hidden cursor-crosshair mx-auto"
                    style={{
                      width: `${CANVAS_WIDTH}px`,
                      height: `${CANVAS_HEIGHT}px`,
                      minWidth: `${CANVAS_WIDTH}px`,
                      background: template.background,
                      backgroundImage: template.backgroundImage ? `url(${template.backgroundImage})` : undefined,
                      backgroundSize: `${template.backgroundScale}%`,
                      backgroundPosition: `${template.backgroundX}% ${template.backgroundY}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded text-sm z-[30000]">
                      Strona 1 (Przód)
                    </div>

                    {template.elements
                      .sort((a, b) => a.zIndex - b.zIndex)
                      .map((element) => (
                        <div
                          key={element.id}
                          className={`absolute cursor-move ${selectedElement === element.id ? "outline outline-2 outline-blue-500 outline-offset-2" : ""}`}
                          style={{
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            zIndex: element.zIndex,
                            transform: getTransform(element),
                            opacity: element.opacity / 100,
                          }}
                          onMouseDown={(e) => handleMouseDown(e, element.id)}
                        >
                          {element.type === "qrcode" && (
                            <div
                              style={{
                                background: element.qrBackgroundTransparent ? "transparent" : element.qrBackgroundColor,
                                backgroundImage: element.qrBackgroundImage
                                  ? `url(${element.qrBackgroundImage})`
                                  : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                padding: "8px",
                                display: "inline-block",
                              }}
                            >
                              {qrCodeDataUrl && (
                                <img
                                  src={qrCodeDataUrl || "/placeholder.svg"}
                                  alt="QR Code"
                                  style={{ width: element.size, height: element.size }}
                                />
                              )}
                            </div>
                          )}
                          {element.type === "text" && (
                            <div
                              style={{
                                fontSize: `${element.fontSize}px`,
                                color: element.color,
                                whiteSpace: "nowrap",
                                fontWeight: element.fontWeight,
                                textAlign: element.textAlign,
                              }}
                            >
                              {element.content}
                            </div>
                          )}
                          {element.type === "image" && element.imageUrl && (
                            <img
                              src={element.imageUrl || "/placeholder.svg"}
                              alt="Element"
                              style={{
                                width: `${element.width}px`,
                                height: `${element.height}px`,
                                objectFit: "contain",
                              }}
                            />
                          )}
                        </div>
                      ))}

                    <div
                      className="absolute bottom-2 left-0 right-0 text-center z-[10000] pointer-events-none"
                      style={{
                        fontSize: `${template.domainFontSize}px`,
                        color: template.domainColor,
                      }}
                    >
                      {template.domainText}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fold line */}
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>⬇ Linia zgięcia - Druga strona (Tył) ⬇</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Second page (Back) - Mirrored */}
              <div className="space-y-2">
                <div className="overflow-x-auto">
                  <div
                    className="relative border-2 border-dashed border-border rounded-lg overflow-hidden mx-auto"
                    style={{
                      width: `${CANVAS_WIDTH}px`,
                      height: `${CANVAS_HEIGHT}px`,
                      minWidth: `${CANVAS_WIDTH}px`,
                      background: template.background,
                      backgroundImage: template.backgroundImage ? `url(${template.backgroundImage})` : undefined,
                      backgroundSize: `${template.backgroundScale}%`,
                      backgroundPosition: `${100 - template.backgroundX}% ${template.backgroundY}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <div
                      className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded text-sm z-[30000]"
                      style={{ transform: "scaleX(-1)" }}
                    >
                      Strona 2 (Tył - odbicie)
                    </div>

                    {template.elements
                      .sort((a, b) => a.zIndex - b.zIndex)
                      .map((element) => {
                        const elementWidth =
                          element.type === "qrcode"
                            ? element.size || 150
                            : element.type === "image"
                              ? element.width || 100
                              : 100
                        const mirroredX = CANVAS_WIDTH - element.x - elementWidth

                        const transforms = []
                        if (element.scale !== 100) transforms.push(`scale(${element.scale / 100})`)
                        if (element.rotation) transforms.push(`rotate(${element.rotation}deg)`)
                        transforms.push("scaleX(-1)") // Only one horizontal flip for mirror effect
                        if (element.flipVertical) transforms.push("scaleY(-1)")

                        return (
                          <div
                            key={`mirror-${element.id}`}
                            className="absolute pointer-events-none"
                            style={{
                              left: `${mirroredX}px`,
                              top: `${element.y}px`,
                              zIndex: element.zIndex,
                              transform: transforms.join(" "),
                              opacity: element.opacity / 100,
                            }}
                          >
                            {element.type === "qrcode" && (
                              <div
                                style={{
                                  background: element.qrBackgroundTransparent
                                    ? "transparent"
                                    : element.qrBackgroundColor,
                                  backgroundImage: element.qrBackgroundImage
                                    ? `url(${element.qrBackgroundImage})`
                                    : undefined,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                  padding: "8px",
                                  display: "inline-block",
                                }}
                              >
                                {qrCodeDataUrl && (
                                  <img
                                    src={qrCodeDataUrl || "/placeholder.svg"}
                                    alt="QR Code"
                                    style={{ width: element.size, height: element.size }}
                                  />
                                )}
                              </div>
                            )}
                            {element.type === "text" && (
                              <div
                                style={{
                                  fontSize: `${element.fontSize}px`,
                                  color: element.color,
                                  whiteSpace: "nowrap",
                                  fontWeight: element.fontWeight,
                                  textAlign:
                                    element.textAlign === "left"
                                      ? "right"
                                      : element.textAlign === "right"
                                        ? "left"
                                        : "center",
                                }}
                              >
                                {element.content}
                              </div>
                            )}
                            {element.type === "image" && element.imageUrl && (
                              <img
                                src={element.imageUrl || "/placeholder.svg"}
                                alt="Element"
                                style={{
                                  width: `${element.width}px`,
                                  height: `${element.height}px`,
                                  objectFit: "contain",
                                }}
                              />
                            )}
                          </div>
                        )
                      })}

                    <div
                      className="absolute bottom-2 left-0 right-0 text-center z-[10000] pointer-events-none"
                      style={{
                        fontSize: `${template.domainFontSize}px`,
                        color: template.domainColor,
                        transform: "scaleX(-1)",
                      }}
                    >
                      {template.domainText}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center bg-blue-50 p-3 rounded">
                💡 Wskazówka: Po wydrukowaniu zegnij kartkę A4 na pół po linii zgięcia. Strona 1 i Strona 2 będą się
                idealnie pokrywać!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Element Editor */}
        <Card className="w-full lg:w-80 lg:flex-shrink-0">
          <CardHeader>
            <CardTitle>Użyte elementy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {template.elements.length === 0 &&
            !template.elements.find((el) => el.type === "qrcode" && el.qrBackgroundImage) ? (
              <p className="text-center text-muted-foreground text-sm py-8">Brak elementów</p>
            ) : (
              <>
                {template.elements.find((el) => el.type === "qrcode" && el.qrBackgroundImage) && (
                  <div
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedElement === "qr-background"
                        ? "border-blue-500 bg-blue-50"
                        : "border-border hover:border-gray-400"
                    }`}
                    onClick={() => {
                      const qrElement = template.elements.find((el) => el.type === "qrcode")
                      if (qrElement) setSelectedElement(qrElement.id)
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">🖼️ Tło QR Code</span>
                      <span className="text-xs text-muted-foreground">Obraz</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Obraz tła za kodem QR</div>
                  </div>
                )}

                {[...template.elements]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((element) => (
                    <div
                      key={element.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedElement === element.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-border hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {element.type === "qrcode" && "📱 QR Code"}
                          {element.type === "text" && "📝 Tekst"}
                          {element.type === "image" && "🖼️ Obraz"}
                        </span>
                        <span className="text-xs text-muted-foreground">z:{element.zIndex}</span>
                      </div>
                      {element.type === "text" && (
                        <div className="text-xs text-muted-foreground truncate">{element.content}</div>
                      )}
                      {element.type === "qrcode" && (
                        <div className="text-xs text-muted-foreground">Rozmiar: {element.size}px</div>
                      )}
                      {element.type === "image" && (
                        <div className="text-xs text-muted-foreground">
                          {element.width}x{element.height}px
                        </div>
                      )}
                    </div>
                  ))}
              </>
            )}

            {selectedElementData && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Edycja elementu</Label>
                  <Button size="sm" variant="destructive" onClick={handleDeleteElement}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Szybkie wyrównanie</Label>
                  <div className="grid grid-cols-3 gap-1">
                    <Button size="sm" variant="outline" onClick={() => alignElement("left")} title="Do lewej">
                      <AlignHorizontalJustifyStart className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => alignElement("center")} title="Do środka">
                      <AlignHorizontalJustifyCenter className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => alignElement("right")} title="Do prawej">
                      <AlignHorizontalJustifyEnd className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => alignElement("top")} title="Do góry">
                      <AlignVerticalJustifyStart className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => alignElement("middle")} title="Do środka">
                      <AlignVerticalJustifyCenter className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => alignElement("bottom")} title="Do dołu">
                      <AlignVerticalJustifyEnd className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-1 h-auto gap-1">
                    <TabsTrigger value="general" className="justify-start">
                      Ogólne
                    </TabsTrigger>
                    <TabsTrigger value="style" className="justify-start">
                      Styl
                    </TabsTrigger>
                    <TabsTrigger value="transform" className="justify-start">
                      Transformacja
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="justify-start">
                      Zaawansowane
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-3 mt-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Skala: {selectedElementData.scale || 100}%</Label>
                      <Slider
                        value={[selectedElementData.scale || 100]}
                        onValueChange={(v) => handleElementUpdate(selectedElement!, { scale: v[0] })}
                        min={10}
                        max={200}
                        step={5}
                      />
                      <p className="text-xs text-muted-foreground">Zwiększ lub pomniejsz element</p>
                    </div>

                    {selectedElementData.type === "text" && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Treść</Label>
                          <Input
                            value={selectedElementData.content || ""}
                            onChange={(e) => handleElementUpdate(selectedElement!, { content: e.target.value })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Rozmiar czcionki</Label>
                          <Input
                            type="number"
                            value={selectedElementData.fontSize || 16}
                            onChange={(e) =>
                              handleElementUpdate(selectedElement!, { fontSize: Number.parseInt(e.target.value) })
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </>
                    )}
                    {selectedElementData.type === "qrcode" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Rozmiar QR</Label>
                        <Input
                          type="number"
                          value={selectedElementData.size || 150}
                          onChange={(e) =>
                            handleElementUpdate(selectedElement!, { size: Number.parseInt(e.target.value) })
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                    {selectedElementData.type === "image" && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Szerokość</Label>
                          <Input
                            type="number"
                            value={selectedElementData.width || 100}
                            onChange={(e) =>
                              handleElementUpdate(selectedElement!, { width: Number.parseInt(e.target.value) })
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Wysokość</Label>
                          <Input
                            type="number"
                            value={selectedElementData.height || 100}
                            onChange={(e) =>
                              handleElementUpdate(selectedElement!, { height: Number.parseInt(e.target.value) })
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Pozycja X</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElementData.x)}
                          onChange={(e) =>
                            handleElementUpdate(selectedElement!, { x: Number.parseInt(e.target.value) })
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Pozycja Y</Label>
                        <Input
                          type="number"
                          value={Math.round(selectedElementData.y)}
                          onChange={(e) =>
                            handleElementUpdate(selectedElement!, { y: Number.parseInt(e.target.value) })
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="style" className="space-y-3 mt-3">
                    {selectedElementData.type === "text" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Kolor tekstu</Label>
                        <Input
                          type="color"
                          value={selectedElementData.color || "#000000"}
                          onChange={(e) => handleElementUpdate(selectedElement!, { color: e.target.value })}
                          className="h-10"
                        />
                      </div>
                    )}
                    {selectedElementData.type === "qrcode" && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Kolor QR</Label>
                          <Input
                            type="color"
                            value={selectedElementData.backgroundColor || "#000000"}
                            onChange={(e) => handleElementUpdate(selectedElement!, { backgroundColor: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Przezroczyste tło QR</Label>
                          <Switch
                            checked={selectedElementData.qrBackgroundTransparent}
                            onCheckedChange={(checked) =>
                              handleElementUpdate(selectedElement!, { qrBackgroundTransparent: checked })
                            }
                          />
                        </div>
                        {!selectedElementData.qrBackgroundTransparent && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs">Kolor tła QR</Label>
                              <Input
                                type="color"
                                value={selectedElementData.qrBackgroundColor || "#ffffff"}
                                onChange={(e) =>
                                  handleElementUpdate(selectedElement!, { qrBackgroundColor: e.target.value })
                                }
                                className="h-10"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Obraz tła QR (opcjonalnie)</Label>
                              <input
                                ref={qrBackgroundInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleQRBackgroundImageUpload}
                                className="hidden"
                              />
                              <Button
                                className="w-full bg-transparent"
                                variant="outline"
                                size="sm"
                                onClick={() => qrBackgroundInputRef.current?.click()}
                              >
                                📤 Wgraj tło QR
                              </Button>
                              {selectedElementData.qrBackgroundImage && (
                                <Button
                                  className="w-full"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleElementUpdate(selectedElement!, { qrBackgroundImage: undefined })
                                  }
                                >
                                  🗑️ Usuń tło QR
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">Przezroczystność: {selectedElementData.opacity}%</Label>
                      <Slider
                        value={[selectedElementData.opacity || 100]}
                        onValueChange={(v) => handleElementUpdate(selectedElement!, { opacity: v[0] })}
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="transform" className="space-y-3 mt-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Rotacja: {selectedElementData.rotation}°</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleElementUpdate(selectedElement!, {
                              rotation: ((selectedElementData.rotation || 0) + 90) % 360,
                            })
                          }
                        >
                          <RotateCw className="w-3 h-3" />
                        </Button>
                      </div>
                      <Slider
                        value={[selectedElementData.rotation || 0]}
                        onValueChange={(v) => handleElementUpdate(selectedElement!, { rotation: v[0] })}
                        min={0}
                        max={360}
                        step={15}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Odbicie poziome</Label>
                      <Switch
                        checked={selectedElementData.flipHorizontal}
                        onCheckedChange={(checked) =>
                          handleElementUpdate(selectedElement!, { flipHorizontal: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Odbicie pionowe</Label>
                      <Switch
                        checked={selectedElementData.flipVertical}
                        onCheckedChange={(checked) => handleElementUpdate(selectedElement!, { flipVertical: checked })}
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() =>
                        handleElementUpdate(selectedElement!, {
                          rotation: 0,
                          flipHorizontal: false,
                          flipVertical: false,
                          scale: 100,
                        })
                      }
                    >
                      ↺ Resetuj transformacje
                    </Button>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-3 mt-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Z-Index (warstwa)</Label>
                      <Input
                        type="number"
                        value={selectedElementData.zIndex}
                        onChange={(e) =>
                          handleElementUpdate(selectedElement!, { zIndex: Number.parseInt(e.target.value) })
                        }
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Wyższy z-index = element na wierzchu</p>
                    </div>

                    {selectedElementData.type === "text" && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Grubość czcionki</Label>
                          <Input
                            type="number"
                            value={selectedElementData.fontWeight || 400}
                            onChange={(e) =>
                              handleElementUpdate(selectedElement!, { fontWeight: Number.parseInt(e.target.value) })
                            }
                            min={100}
                            max={900}
                            step={100}
                            className="h-8 text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            100 = cienka, 400 = normalna, 700 = pogrubiona
                          </p>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Wyrównanie tekstu</Label>
                          <div className="grid grid-cols-3 gap-1">
                            <Button
                              size="sm"
                              variant={selectedElementData.textAlign === "left" ? "default" : "outline"}
                              onClick={() => handleElementUpdate(selectedElement!, { textAlign: "left" })}
                            >
                              Do lewej
                            </Button>
                            <Button
                              size="sm"
                              variant={selectedElementData.textAlign === "center" ? "default" : "outline"}
                              onClick={() => handleElementUpdate(selectedElement!, { textAlign: "center" })}
                            >
                              Środek
                            </Button>
                            <Button
                              size="sm"
                              variant={selectedElementData.textAlign === "right" ? "default" : "outline"}
                              onClick={() => handleElementUpdate(selectedElement!, { textAlign: "right" })}
                            >
                              Do prawej
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="border-t pt-3 space-y-2">
                      <Label className="text-xs font-semibold">💡 Wskazówka</Label>
                      <p className="text-xs text-muted-foreground">
                        Ustawienia zaawansowane dla całej aplikacji (custom CSS/JS) znajdują się w głównym menu w
                        zakładce "Zaawansowane".
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saved Templates */}
      {savedTemplates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Zapisane szablony</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedTemplates.map((t) => (
                <Card key={t.id}>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">{t.name}</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => loadTemplate(t)}>
                        Edytuj
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => t.id && deleteTemplate(t.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
