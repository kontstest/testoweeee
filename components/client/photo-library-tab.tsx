"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { Photo } from "@/lib/types/database"
import { ImageIcon } from "lucide-react"

interface PhotoLibraryTabProps {
  eventId: string
}

export function PhotoLibraryTab({ eventId }: PhotoLibraryTabProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  useEffect(() => {
    loadPhotos()
  }, [eventId])

  const loadPhotos = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/events/${eventId}/photos`)
      if (!res.ok) throw new Error("Failed to load photos")
      const data = await res.json()
      setPhotos(data || [])
    } catch (error) {
      console.error("[v0] Error loading photos:", error)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Photo Library</h3>
        <p className="text-sm text-muted-foreground">View all photos uploaded by guests</p>
      </div>

      {photos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
            <p className="text-muted-foreground">Photos uploaded by guests will appear here</p>
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
