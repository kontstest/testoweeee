"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createEventWithClient } from "@/app/actions/admin"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateEventDialog({ open, onOpenChange, onSuccess }: CreateEventDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    eventDate: "",
    clientEmail: "",
    clientFirstName: "",
    clientLastName: "",
    clientPassword: "",
    modules: {
      photo_gallery: false,
      schedule: false,
      menu: false,
      survey: false,
      bingo: false,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await createEventWithClient({
        name: formData.name,
        eventDate: formData.eventDate,
        clientEmail: formData.clientEmail,
        clientFirstName: formData.clientFirstName,
        clientLastName: formData.clientLastName,
        clientPassword: formData.clientPassword,
        modules: formData.modules,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      console.log("[v0] Client created:", {
        email: result.data?.clientEmail,
        password: result.data?.clientPassword,
        eventId: result.data?.event.id,
      })

      setFormData({
        name: "",
        eventDate: "",
        clientEmail: "",
        clientFirstName: "",
        clientLastName: "",
        clientPassword: "",
        modules: {
          photo_gallery: false,
          schedule: false,
          menu: false,
          survey: false,
          bingo: false,
        },
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("[v0] Error creating event:", error)
      setError(error.message || "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>Create a new event instance and client account</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Event Details</h3>
              <div className="grid gap-2">
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  placeholder="John & Jane's Wedding"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                />
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Client Account</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="clientFirstName">First Name</Label>
                  <Input
                    id="clientFirstName"
                    required
                    value={formData.clientFirstName}
                    onChange={(e) => setFormData({ ...formData, clientFirstName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientLastName">Last Name</Label>
                  <Input
                    id="clientLastName"
                    required
                    value={formData.clientLastName}
                    onChange={(e) => setFormData({ ...formData, clientLastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  required
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientPassword">Password</Label>
                <Input
                  id="clientPassword"
                  type="password"
                  placeholder="Temporary password for client"
                  required
                  value={formData.clientPassword}
                  onChange={(e) => setFormData({ ...formData, clientPassword: e.target.value })}
                />
              </div>
            </div>

            {/* Modules */}
            <div className="space-y-4">
              <h3 className="font-semibold">Enabled Modules</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="photo_gallery"
                    checked={formData.modules.photo_gallery}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        modules: { ...formData.modules, photo_gallery: checked as boolean },
                      })
                    }
                  />
                  <Label htmlFor="photo_gallery" className="cursor-pointer">
                    Photo Gallery - Let guests upload and share photos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="schedule"
                    checked={formData.modules.schedule}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        modules: { ...formData.modules, schedule: checked as boolean },
                      })
                    }
                  />
                  <Label htmlFor="schedule" className="cursor-pointer">
                    Schedule - Display event timeline
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="menu"
                    checked={formData.modules.menu}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        modules: { ...formData.modules, menu: checked as boolean },
                      })
                    }
                  />
                  <Label htmlFor="menu" className="cursor-pointer">
                    Menu - Show food and drinks
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="survey"
                    checked={formData.modules.survey}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        modules: { ...formData.modules, survey: checked as boolean },
                      })
                    }
                  />
                  <Label htmlFor="survey" className="cursor-pointer">
                    Survey - Collect guest feedback
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bingo"
                    checked={formData.modules.bingo}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        modules: { ...formData.modules, bingo: checked as boolean },
                      })
                    }
                  />
                  <Label htmlFor="bingo" className="cursor-pointer">
                    Bingo - Interactive game for guests
                  </Label>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
