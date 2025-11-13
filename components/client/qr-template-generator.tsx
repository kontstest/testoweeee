"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Save, Edit, Trash2, ImageIcon, Type, QrCode } from "lucide-react"
import type { Event, QRTemplate, Vendor } from "@/lib/types/database"
import QRCode from "qrcode"
import { useToast } from "@/components/ui/use-toast" // Import useToast

interface QRTemplateGeneratorProps {
  event: Event
}

type TemplateStyle = "elegant" | "modern" | "rustic" | "floral" | "geometric"

interface DraggableElement {
  id: string
  type: "text" | "image" | "qr" | "vendors"
  x: number
  y: number
  content?: string
  width?: number
  height?: number
}

export function QRTemplateGenerator({ event }: QRTemplateGeneratorProps) {
  const [templates, setTemplates] = useState<QRTemplate[]>([])
  const [currentTemplate, setCurrentTemplate] = useState<QRTemplate | null>(null)
  const [templateName, setTemplateName] = useState("Mój szablon")
  const [style, setStyle] = useState<TemplateStyle>("elegant")
  const [primaryColor, setPrimaryColor] = useState(event.primary_color || "#ec4899")
  const [secondaryColor, setSecondaryColor] = useState(event.secondary_color || "#9333ea")
  const [backgroundType, setBackgroundType] = useState<"color" | "image">("color")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [qrBackgroundColor, setQrBackgroundColor] = useState("#ffffff")
  const [customText, setCustomText] = useState(`Zeskanuj kod QR\naby zobaczyć szczegóły\ni podzielić się zdjęciami`)
  const [includeVendors, setIncludeVendors] = useState(true)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [elements, setElements] = useState<DraggableElement[]>([
    { id: "title", type: "text", x: 50, y: 10, content: event.name },
    { id: "date", type: "text", x: 50, y: 18, content: new Date(event.event_date).toLocaleDateString("pl-PL") },
    { id: "qr", type: "qr", x: 50, y: 35, width: 30, height: 30 },
    { id: "info", type: "text", x: 50, y: 70, content: customText },
  ])
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")

  const canvasRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const loadTemplate = (template: QRTemplate) => {
    setCurrentTemplate(template)
    setTemplateName(template.name)
    setStyle(template.style as TemplateStyle)
    setPrimaryColor(template.primary_color)
    setSecondaryColor(template.secondary_color)
    setBackgroundType(template.background_type as "color" | "image")
    setBackgroundColor(template.background_type === "color" ? template.background_value : "#ffffff")
    setBackgroundImage(template.background_type === "image" ? template.background_value : null)
    setQrBackgroundColor(template.qr_background_color)
    setCustomText(template.custom_text)
    setIncludeVendors(template.include_vendors)
    setElements(template.elements)
  } // Declare loadTemplate function

  useEffect(() => {
    fetchTemplates()
    fetchVendors()
    generateQRCode()
  }, [event.id])

  useEffect(() => {
    generateQRCode()
  }, [qrBackgroundColor])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/qr-templates`)
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error("[v0] Error fetching templates:", error)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/vendors`)
      const data = await response.json()
      setVendors(data)
    } catch (error) {
      console.error("[v0] Error fetching vendors:", error)
    }
  }

  const generateQRCode = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/event/${event.id}`
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 800,
        margin: 2,
        color: {
          dark: primaryColor,
          light: qrBackgroundColor,
        },
      })
      setQrCodeDataUrl(qrDataUrl)
    } catch (err) {
      console.error("[v0] Error generating QR code:", err)
    }
  }

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setBackgroundImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleElementDragStart = (elementId: string) => {
    setDraggedElement(elementId)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedElement || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setElements((prev) => prev.map((el) => (el.id === draggedElement ? { ...el, x, y } : el)))
    setDraggedElement(null)
  }

  const saveTemplate = async () => {
    const templateData = {
      event_id: event.id,
      name: templateName,
      style,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      background_type: backgroundType,
      background_value: backgroundType === "color" ? backgroundColor : backgroundImage,
      qr_background_color: qrBackgroundColor,
      custom_text: customText,
      decor_image: null,
      include_vendors: includeVendors,
      elements: elements,
    }

    try {
      const method = currentTemplate ? "PUT" : "POST"
      const url = currentTemplate
        ? `/api/events/${event.id}/qr-templates/${currentTemplate.id}`
        : `/api/events/${event.id}/qr-templates`

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      })

      if (!response.ok) throw new Error("Failed to save template")

      toast({
        title: "Sukces",
        description: currentTemplate ? "Szablon został zaktualizowany" : "Szablon został zapisany",
      })
      fetchTemplates()
    } catch (error) {
      toast({ title: "Błąd", description: "Nie udało się zapisać szablonu", variant: "destructive" })
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten szablon?")) return

    try {
      const response = await fetch(`/api/events/${event.id}/qr-templates/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete")

      toast({ title: "Sukces", description: "Szablon został usunięty" })
      fetchTemplates()
      if (currentTemplate?.id === id) setCurrentTemplate(null)
    } catch (error) {
      toast({ title: "Błąd", description: "Nie udało się usunąć szablonu", variant: "destructive" })
    }
  }

  const downloadTemplate = () => {
    // Implementation for downloading the template as PDF/PNG
    toast({ title: "Info", description: "Funkcja pobierania w przygotowaniu" })
  }

  const getStyleClasses = () => {
    switch (style) {
      case "elegant":
        return "font-serif"
      case "modern":
        return "font-sans"
      case "rustic":
        return "font-serif"
      case "floral":
        return "font-script"
      case "geometric":
        return "font-sans"
      default:
        return "font-serif"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ustawienia Szablonu</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="style" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="style">Styl</TabsTrigger>
                  <TabsTrigger value="colors">Kolory</TabsTrigger>
                  <TabsTrigger value="background">Tło</TabsTrigger>
                  <TabsTrigger value="content">Treść</TabsTrigger>
                </TabsList>

                <TabsContent value="style" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nazwa szablonu</Label>
                    <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Styl</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["elegant", "modern", "rustic", "floral", "geometric"] as TemplateStyle[]).map((s) => (
                        <Button
                          key={s}
                          variant={style === s ? "default" : "outline"}
                          onClick={() => setStyle(s)}
                          className="capitalize"
                        >
                          {s === "elegant" && "Elegancki"}
                          {s === "modern" && "Nowoczesny"}
                          {s === "rustic" && "Rustykalny"}
                          {s === "floral" && "Kwiatowy"}
                          {s === "geometric" && "Geometryczny"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Kolor główny</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-20"
                      />
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Kolor akcentu</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-20"
                      />
                      <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tło QR Code</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={qrBackgroundColor}
                        onChange={(e) => setQrBackgroundColor(e.target.value)}
                        className="w-20"
                      />
                      <Input value={qrBackgroundColor} onChange={(e) => setQrBackgroundColor(e.target.value)} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="background" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Typ tła</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={backgroundType === "color" ? "default" : "outline"}
                        onClick={() => setBackgroundType("color")}
                      >
                        Kolor
                      </Button>
                      <Button
                        variant={backgroundType === "image" ? "default" : "outline"}
                        onClick={() => setBackgroundType("image")}
                      >
                        Zdjęcie
                      </Button>
                    </div>
                  </div>
                  {backgroundType === "color" ? (
                    <div className="space-y-2">
                      <Label>Kolor tła</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-20"
                        />
                        <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Zdjęcie tła</Label>
                      <Input type="file" accept="image/*" onChange={handleBackgroundImageUpload} />
                      {backgroundImage && (
                        <img
                          src={backgroundImage || "/placeholder.svg"}
                          alt="Background"
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tekst informacyjny</Label>
                    <Textarea value={customText} onChange={(e) => setCustomText(e.target.value)} rows={4} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeVendors"
                      checked={includeVendors}
                      onChange={(e) => setIncludeVendors(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="includeVendors">Dołącz usługodawców</Label>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex gap-2">
                <Button onClick={saveTemplate} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Zapisz szablon
                </Button>
                <Button onClick={downloadTemplate} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Pobierz
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Elementy (przeciągnij na podgląd)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                Kliknij element, a następnie kliknij na podglądzie aby go umieścić
              </p>
              {elements.map((el) => (
                <Button
                  key={el.id}
                  variant={draggedElement === el.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleElementDragStart(el.id)}
                >
                  {el.type === "text" && <Type className="w-4 h-4 mr-2" />}
                  {el.type === "qr" && <QrCode className="w-4 h-4 mr-2" />}
                  {el.type === "image" && <ImageIcon className="w-4 h-4 mr-2" />}
                  {el.id === "title" && "Tytuł"}
                  {el.id === "date" && "Data"}
                  {el.id === "qr" && "Kod QR"}
                  {el.id === "info" && "Tekst informacyjny"}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Podgląd na żywo</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`relative w-full aspect-[210/297] border-2 border-dashed border-border rounded-lg overflow-hidden cursor-crosshair ${getStyleClasses()}`}
                style={{
                  backgroundColor: backgroundType === "color" ? backgroundColor : undefined,
                  backgroundImage:
                    backgroundType === "image" && backgroundImage ? `url(${backgroundImage})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {elements.map((el) => (
                  <div
                    key={el.id}
                    className="absolute"
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      transform: "translate(-50%, -50%)",
                      width: el.width ? `${el.width}%` : "auto",
                      height: el.height ? `${el.height}%` : "auto",
                    }}
                  >
                    {el.type === "text" && (
                      <div
                        className="text-center whitespace-pre-wrap px-4"
                        style={{
                          color: el.id === "title" ? primaryColor : secondaryColor,
                          fontSize: el.id === "title" ? "2rem" : "1rem",
                          fontWeight: el.id === "title" ? "bold" : "normal",
                        }}
                      >
                        {el.content}
                      </div>
                    )}
                    {el.type === "qr" && qrCodeDataUrl && (
                      <div className="p-4 bg-white rounded-lg shadow-lg">
                        <img src={qrCodeDataUrl || "/placeholder.svg"} alt="QR Code" className="w-full h-full" />
                      </div>
                    )}
                  </div>
                ))}

                {includeVendors && vendors.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <h3 className="font-semibold mb-2" style={{ color: primaryColor }}>
                      Nasi Usługodawcy
                    </h3>
                    <div className="space-y-2 text-sm">
                      {vendors.slice(0, 5).map((vendor) => (
                        <div key={vendor.id} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{vendor.category}:</span> {vendor.name}
                          </div>
                          <div className="flex gap-2">
                            {vendor.website && (
                              <span className="text-blue-600" title="Strona www">
                                🌐
                              </span>
                            )}
                            {vendor.email && (
                              <span className="text-green-600" title="Email">
                                ✉️
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Format A4 (210mm x 297mm) - Kliknij na podglądzie aby umieścić wybrany element
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Zapisane szablony</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nie masz jeszcze zapisanych szablonów</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-4 capitalize">{template.style}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => loadTemplate(template)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Edytuj
                      </Button>
                      <Button size="sm" variant="outline" onClick={downloadTemplate}>
                        <Download className="w-4 h-4 mr-1" />
                        Pobierz
                      </Button>
                      <Button size="sm" variant="outline" onClick={async () => deleteTemplate(template.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
