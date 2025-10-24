"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Upload, Trash2, ImageIcon } from "lucide-react"
import type { Photo } from "@/lib/types/database"
import { useGuestAuth } from "@/lib/hooks/use-guest-auth"
import { GuestAuthDialog } from "../guest-auth-dialog"

interface PhotoGalleryModuleProps {
  eventId: string
  primaryColor: string
}

export function PhotoGalleryModule({ eventId, primaryColor }: PhotoGalleryModuleProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [caption, setCaption] = useState("")
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

  const handleUploadClick = () => {
    if (!user) {
      setShowAuthDialog(true)
      return
    }
    setIsUploadDialogOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFile(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile || !user) return

    setIsUploading(true)

    try {
      // Upload to Supabase Storage
      const fileExt = uploadFile.name.split(".").pop()
      const fileName = `${eventId}/${user.id}-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("event-photos")
        .upload(fileName, uploadFile)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-photos").getPublicUrl(fileName)

      // Save to database
      const { error: dbError } = await supabase.from("photos").insert({
        event_id: eventId,
        uploaded_by: user.id,
        image_url: publicUrl,
        caption: caption || null,
      })

      if (dbError) throw dbError

      // Reset form
      setUploadFile(null)
      setCaption("")
      setIsUploadDialogOpen(false)
      await loadPhotos()
    } catch (error) {
      console.error("[v0] Error uploading photo:", error)
      alert("Failed to upload photo")
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
        <Button onClick={handleUploadClick} style={{ backgroundColor: primaryColor }}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Photo
        </Button>
      </div>

      {photos.length === 0 ? (
        <Card>
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
              className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
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

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {uploadFile && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <img
                  src={URL.createObjectURL(uploadFile) || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Input
                id="caption"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <Button onClick={handleUpload} disabled={!uploadFile || isUploading} className="w-full">
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Detail Dialog */}
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
                {user?.id === selectedPhoto.uploaded_by && (
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedPhoto.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
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
