"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface QRBackgroundUploaderProps {
  qrBackgroundImage?: string
  onUpload: (imageUrl: string) => void
  onRemove: () => void
}

export function QRBackgroundUploader({ qrBackgroundImage, onUpload, onRemove }: QRBackgroundUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onUpload(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">Obraz tła QR (opcjonalnie)</Label>
      <p className="text-xs text-muted-foreground">
        Obraz będzie wyświetlany za kodem QR. Nie można go obracać ani przesuwać.
      </p>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      <Button className="w-full bg-transparent" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        📤 Wgraj tło QR
      </Button>
      {qrBackgroundImage && (
        <>
          <div className="border rounded p-2">
            <img
              src={qrBackgroundImage || "/placeholder.svg"}
              alt="QR Background"
              className="w-full h-20 object-cover rounded"
            />
          </div>
          <Button className="w-full" variant="destructive" size="sm" onClick={onRemove}>
            🗑️ Usuń tło QR
          </Button>
        </>
      )}
    </div>
  )
}
