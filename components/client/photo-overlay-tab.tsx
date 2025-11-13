"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Event } from "@/lib/types/database"

interface PhotoOverlay {
  id: string
  event_id: string
  name: string
  description: string | null
  template_type: "simple" | "elegant" | "festive"
  overlay_svg: string | null
  text_positions: any
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

interface PhotoOverlayTabProps {
  event: Event
  onUpdate: () => void
}

export function PhotoOverlayTab({ event, onUpdate }: PhotoOverlayTabProps) {
  const [loading, setLoading] = useState(false)
  const [overlays, setOverlays] = useState<PhotoOverlay[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_type: "simple" as "simple" | "elegant" | "festive",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadOverlays()
  }, [event.id])

  const loadOverlays = async () => {
    try {
      const res = await fetch(`/api/events/${event.id}/photo-overlays`)
      if (!res.ok) throw new Error("Failed to load overlays")
      const data = await res.json()
      setOverlays(data || [])
    } catch (error) {
      console.error("[v0] Error loading overlays:", error)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Please enter template name", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId
        ? `/api/events/${event.id}/photo-overlays/${editingId}`
        : `/api/events/${event.id}/photo-overlays`

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          template_type: formData.template_type,
        }),
      })

      if (!res.ok) throw new Error("Failed to save template")

      toast({ title: "Success", description: `Template ${editingId ? "updated" : "created"} successfully` })
      setFormData({ name: "", description: "", template_type: "simple" })
      setEditingId(null)
      await loadOverlays()
    } catch (error) {
      console.error("[v0] Error saving overlay:", error)
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      const res = await fetch(`/api/events/${event.id}/photo-overlays/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "Success", description: "Template deleted successfully" })
      await loadOverlays()
    } catch (error) {
      console.error("[v0] Error deleting overlay:", error)
      toast({ title: "Error", description: "Failed to delete template", variant: "destructive" })
    }
  }

  const handleEdit = (overlay: PhotoOverlay) => {
    setEditingId(overlay.id)
    setFormData({
      name: overlay.name,
      description: overlay.description || "",
      template_type: overlay.template_type,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Template" : "Create New Template"}</CardTitle>
          <CardDescription>Add custom photo overlays and templates for your guests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              placeholder="e.g., Wedding Logo Overlay"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the overlay design and purpose"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="template_type">Template Style</Label>
            <Select
              value={formData.template_type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  template_type: value as "simple" | "elegant" | "festive",
                })
              }
            >
              <SelectTrigger id="template_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="elegant">Elegant</SelectItem>
                <SelectItem value="festive">Festive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading && <span className="w-4 h-4 mr-2 animate-spin">Loading...</span>}
              {editingId ? "Update Template" : "Create Template"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingId(null)
                  setFormData({ name: "", description: "", template_type: "simple" })
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {overlays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Templates</CardTitle>
            <CardDescription>{overlays.length} template(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overlays.map((overlay) => (
              <div key={overlay.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{overlay.name}</h4>
                  <p className="text-sm text-muted-foreground">{overlay.description}</p>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 inline-block mt-2">
                    {overlay.template_type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(overlay)}>
                    <span className="w-4 h-4">Edit</span>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(overlay.id)}>
                    <span className="w-4 h-4">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
