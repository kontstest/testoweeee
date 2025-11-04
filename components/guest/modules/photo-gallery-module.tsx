"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Upload, ImageIcon, X, Check, Heart, User } from "lucide-react"
import type { Photo } from "@/lib/types/database"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { translations } from "@/lib/i18n/translations"
import { useLanguage } from "@/lib/hooks/use-language"

interface PhotoGalleryModuleProps {
  eventId: string
  primaryColor: string
}

interface PendingPhoto {
  file: File
  preview: string
  caption: string
  wishes: string
  authorName: string
}

export function PhotoGalleryModule({ eventId, primaryColor }: PhotoGalleryModuleProps) {
  const { language } = useLanguage()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const supabase = createClient()
  const t = translations[language].modules.photoGallery

  useEffect(() => {
    loadPhotos()
  }, [eventId])

  const loadPhotos = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })

    if (data) {
      setPhotos(data)
    }
    setIsLoading(false)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPendingPhotos = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      wishes: "",
      authorName: "",
    }))
    setPendingPhotos((prev) => [...prev, ...newPendingPhotos])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    multiple: true,
  })

  const removePendingPhoto = (index: number) => {
    setPendingPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const updatePendingPhoto = (index: number, field: keyof PendingPhoto, value: string) => {
    setPendingPhotos((prev) => prev.map((photo, i) => (i === index ? { ...photo, [field]: value } : photo)))
  }

  const handleUploadAll = async () => {
    if (pendingPhotos.length === 0) return

    setIsUploading(true)

    try {
      for (const pendingPhoto of pendingPhotos) {
        const fileExt = pendingPhoto.file.name.split(".").pop()
        const fileName = `${eventId}/guest-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("event-photos").upload(fileName, pendingPhoto.file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-photos").getPublicUrl(fileName)

        const { error: dbError } = await supabase.from("photos").insert({
          event_id: eventId,
          uploaded_by: null,
          image_url: publicUrl,
          caption: pendingPhoto.caption || null,
          wishes: pendingPhoto.wishes || null,
          author_name: pendingPhoto.authorName || null,
        })

        if (dbError) throw dbError
        URL.revokeObjectURL(pendingPhoto.preview)
      }

      setPendingPhotos([])
      setIsUploadDialogOpen(false)
      await loadPhotos()
    } catch (error) {
      console.error("[v0] Error uploading photos:", error)
      alert("Failed to upload photos. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">{t.title}</h2>
          <p className="text-gray-600 text-lg">{t.description}</p>
        </div>
        <Button
          onClick={() => setIsUploadDialogOpen(true)}
          size="lg"
          className="text-white shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          <Upload className="w-5 h-5 mr-2" />
          {t.uploadButton}
        </Button>
      </div>

      {photos.length === 0 ? (
        <Card
          className="border-2 border-dashed"
          style={{ borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}05` }}
        >
          <CardContent className="py-20 text-center">
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <ImageIcon className="w-12 h-12" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-2xl font-bold mb-3">{t.noPhotos}</h3>
            <p className="text-gray-600 mb-6 text-lg">{t.beFirst}</p>
            <Button
              onClick={() => setIsUploadDialogOpen(true)}
              size="lg"
              style={{ backgroundColor: primaryColor }}
              className="text-white"
            >
              {t.uploadFirst}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo, index) => (
            <Card
              key={photo.id}
              className={cn(
                "group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500",
                "bg-white hover:-translate-y-2",
              )}
              style={{ borderColor: `${primaryColor}20`, borderWidth: "2px" }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={photo.image_url || "/placeholder.svg"}
                  alt={photo.caption || "Event photo"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {(photo.caption || photo.wishes || photo.author_name) && (
                <CardContent className="p-4 space-y-2">
                  {photo.caption && <p className="text-sm font-medium text-gray-900 line-clamp-2">{photo.caption}</p>}
                  {photo.wishes && <p className="text-sm text-gray-600 line-clamp-2 italic">"{photo.wishes}"</p>}
                  {photo.author_name && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {photo.author_name}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t.uploadButton}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={cn(
                "border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300",
                isDragActive ? "scale-105" : "hover:opacity-80",
              )}
              style={{
                borderColor: isDragActive ? primaryColor : `${primaryColor}40`,
                backgroundColor: isDragActive ? `${primaryColor}10` : `${primaryColor}05`,
              }}
            >
              <input {...getInputProps()} />
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Upload className="w-10 h-10" style={{ color: primaryColor }} />
              </div>
              {isDragActive ? (
                <p className="text-xl font-semibold" style={{ color: primaryColor }}>
                  {t.dragDrop}...
                </p>
              ) : (
                <>
                  <p className="text-xl font-semibold mb-2">{t.dragDrop}</p>
                  <p className="text-gray-500">{t.orClick}</p>
                  <p className="text-sm text-gray-400 mt-2">📱 {t.mobileCamera || "Or use your device camera"}</p>
                </>
              )}
            </div>

            {pendingPhotos.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Photos to Upload ({pendingPhotos.length})</Label>
                  <Button
                    onClick={handleUploadAll}
                    disabled={isUploading}
                    size="lg"
                    style={{ backgroundColor: primaryColor }}
                    className="text-white"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    {isUploading ? t.uploading : t.confirmUpload}
                  </Button>
                </div>
                <div className="space-y-6">
                  {pendingPhotos.map((photo, index) => (
                    <Card key={index} className="relative group border-2">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 z-10 shadow-lg"
                        onClick={() => removePendingPhoto(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="grid md:grid-cols-2 gap-6 p-6">
                        <div className="aspect-square relative rounded-lg overflow-hidden">
                          <img
                            src={photo.preview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              {t.caption}
                            </Label>
                            <Input
                              placeholder={t.caption}
                              value={photo.caption}
                              onChange={(e) => updatePendingPhoto(index, "caption", e.target.value)}
                              className="text-base"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              {t.wishes}
                            </Label>
                            <Textarea
                              placeholder={t.wishes}
                              value={photo.wishes}
                              onChange={(e) => updatePendingPhoto(index, "wishes", e.target.value)}
                              className="text-base min-h-[100px]"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {t.yourName}
                            </Label>
                            <Input
                              placeholder={t.yourName}
                              value={photo.authorName}
                              onChange={(e) => updatePendingPhoto(index, "authorName", e.target.value)}
                              className="text-base"
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          {selectedPhoto && (
            <div className="space-y-6">
              <div className="relative w-full max-h-[60vh] rounded-xl overflow-hidden">
                <img
                  src={selectedPhoto.image_url || "/placeholder.svg"}
                  alt={selectedPhoto.caption || "Event photo"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-4">
                {selectedPhoto.caption && (
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{t.caption}</h3>
                    <p className="text-gray-700">{selectedPhoto.caption}</p>
                  </div>
                )}
                {selectedPhoto.wishes && (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Heart className="w-5 h-5" style={{ color: primaryColor }} />
                      {t.wishes}
                    </h3>
                    <p className="text-gray-700 italic">"{selectedPhoto.wishes}"</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t">
                  {selectedPhoto.author_name && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      From: <span className="font-medium">{selectedPhoto.author_name}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{new Date(selectedPhoto.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
