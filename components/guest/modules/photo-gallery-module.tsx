"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Upload, ImageIcon, X, Check } from "lucide-react"
import type { Photo } from "@/lib/types/database"
import { useGuestAuth } from "@/lib/hooks/use-guest-auth"
import { GuestAuthDialog } from "../guest-auth-dialog"
import { useDropzone } from "react-dropzone"

interface PhotoGalleryModuleProps {
  eventId: string
  primaryColor: string
}

interface PendingPhoto {
  file: File
  preview: string
  caption: string
}

export function PhotoGalleryModule({ eventId, primaryColor }: PhotoGalleryModuleProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const { user } = useGuestAuth()
  const supabase = createClient()

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

  const updatePendingCaption = (index: number, caption: string) => {
    setPendingPhotos((prev) => prev.map((photo, i) => (i === index ? { ...photo, caption } : photo)))
  }

  const handleUploadClick = () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }
    setIsUploadDialogOpen(true)
  }

  const handleUploadAll = async () => {
    if (pendingPhotos.length === 0 || !user) return

    setIsUploading(true)

    try {
      for (const pendingPhoto of pendingPhotos) {
        const fileExt = pendingPhoto.file.name.split(".").pop()
        const fileName = `${eventId}/${user.id}-${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from("event-photos").upload(fileName, pendingPhoto.file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-photos").getPublicUrl(fileName)

        const { error: dbError } = await supabase.from("photos").insert({
          event_id: eventId,
          uploaded_by: user.id,
          image_url: publicUrl,
          caption: pendingPhoto.caption || null,
        })

        if (dbError) throw dbError
        URL.revokeObjectURL(pendingPhoto.preview)
      }

      setPendingPhotos([])
      setIsUploadDialogOpen(false)
      await loadPhotos()
    } catch (error) {
      console.error("[v0] Error uploading photos:", error)
      alert("Failed to upload photos")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    const { error } = await supabase.from("photos").delete().eq("id", photoId)

    if (!error) {
      await loadPhotos()
      setSelectedPhoto(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading photos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Photo Gallery</h2>
          <p className="text-muted-foreground">Share your favorite moments</p>
        </div>
        <Button
          onClick={handleUploadClick}
          style={{ backgroundColor: primaryColor }}
          className="hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
      </div>

      {photos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to share a memory!</p>
            <Button onClick={handleUploadClick} style={{ backgroundColor: primaryColor }}>
              Upload First Photo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className="cursor-pointer overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="aspect-square relative">
                <img
                  src={photo.image_url || "/placeholder.svg"}
                  alt={photo.caption || "Event photo"}
                  className="w-full h-full object-cover"
                />
              </div>
              {photo.caption && (
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{photo.caption}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Photos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the photos here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">Drag & drop photos here</p>
                  <p className="text-sm text-muted-foreground">or click to select files</p>
                </>
              )}
            </div>

            {pendingPhotos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Photos to Upload ({pendingPhotos.length})</Label>
                  <Button
                    onClick={handleUploadAll}
                    disabled={isUploading}
                    style={{ backgroundColor: primaryColor }}
                    className="hover:opacity-90"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isUploading ? "Uploading..." : "Confirm Upload"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {pendingPhotos.map((photo, index) => (
                    <Card key={index} className="relative group">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePendingPhoto(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <div className="aspect-square relative">
                        <img
                          src={photo.preview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      </div>
                      <CardContent className="p-3">
                        <input
                          type="text"
                          placeholder="Add caption (optional)"
                          value={photo.caption}
                          onChange={(e) => updatePendingCaption(index, e.target.value)}
                          className="w-full text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="relative w-full max-h-[70vh] rounded-lg overflow-hidden">
                <img
                  src={selectedPhoto.image_url || "/placeholder.svg"}
                  alt={selectedPhoto.caption || "Event photo"}
                  className="w-full h-full object-contain"
                />
              </div>
              {selectedPhoto.caption && (
                <div>
                  <p className="text-lg">{selectedPhoto.caption}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedPhoto.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <GuestAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={() => {
          setShowAuthDialog(false)
          setIsUploadDialogOpen(true)
        }}
        eventId={eventId}
      />
    </div>
  )
}
