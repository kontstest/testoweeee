"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Event } from "@/lib/types/database"

interface ModulesVisibilityTabProps {
  event: Event
  onUpdate: () => void
}

export function ModulesVisibilityTab({ event, onUpdate }: ModulesVisibilityTabProps) {
  const [loading, setLoading] = useState(false)
  const [visibility, setVisibility] = useState({
    photo_gallery: event.module_photo_gallery_visible ?? true,
    schedule: event.module_schedule_visible ?? true,
    menu: event.module_menu_visible ?? true,
    survey: event.module_survey_visible ?? true,
    bingo: event.module_bingo_visible ?? true,
    photo_overlay: event.module_photo_overlay_visible ?? true,
    vendors: event.module_vendors_visible ?? true,
  })
  const { toast } = useToast()
  const supabase = createClient()
  const isWedding = event.event_type === "wedding"

  const modules = [
    {
      key: "photo_gallery" as const,
      label: "Photo Gallery",
      description: "Allow guests to upload and view photos",
      purchased: event.module_photo_gallery,
      icon: "📸",
    },
    {
      key: "schedule" as const,
      label: "Schedule",
      description: "Display event timeline and schedule",
      purchased: event.module_schedule,
      icon: "📅",
    },
    {
      key: "menu" as const,
      label: "Menu",
      description: "Show food and drink options",
      purchased: event.module_menu,
      icon: "🍽️",
    },
    {
      key: "survey" as const,
      label: "Survey",
      description: "Collect feedback from guests",
      purchased: event.module_survey,
      icon: "📝",
    },
    {
      key: "bingo" as const,
      label: "Bingo",
      description: "Interactive bingo game for guests",
      purchased: event.module_bingo,
      icon: "🎲",
    },
    ...(isWedding
      ? [
          {
            key: "photo_overlay" as const,
            label: "Photo with Template",
            description: "Custom overlays and templates for photos",
            purchased: event.module_photo_overlay,
            icon: "🖼️",
          },
        ]
      : []),
    {
      key: "vendors" as const,
      label: isWedding ? "Vendors" : "Partners",
      description: isWedding ? "Display wedding vendors information" : "Show event partners and sponsors",
      purchased: isWedding,
      icon: "👥",
    },
  ]

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("events")
        .update({
          module_photo_gallery_visible: visibility.photo_gallery,
          module_schedule_visible: visibility.schedule,
          module_menu_visible: visibility.menu,
          module_survey_visible: visibility.survey,
          module_bingo_visible: visibility.bingo,
          module_photo_overlay_visible: visibility.photo_overlay,
          module_vendors_visible: visibility.vendors,
        })
        .eq("id", event.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Module visibility settings updated successfully",
      })
      onUpdate()
    } catch (error) {
      console.error("Error updating visibility:", error)
      toast({
        title: "Error",
        description: "Failed to update module visibility",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Module Visibility</CardTitle>
          <CardDescription>
            Control which modules are visible to your guests. You can hide purchased modules if you change your mind.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {modules.map((module) => (
            <div
              key={module.key}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                !module.purchased ? "opacity-50 bg-muted" : ""
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="text-3xl">{module.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label htmlFor={module.key} className="text-base font-semibold cursor-pointer">
                      {module.label}
                    </Label>
                    {!module.purchased && (
                      <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800">Not Purchased</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {visibility[module.key] ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                <Switch
                  id={module.key}
                  checked={visibility[module.key]}
                  onCheckedChange={(checked) =>
                    setVisibility((prev) => ({
                      ...prev,
                      [module.key]: checked,
                    }))
                  }
                  disabled={!module.purchased}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Visibility Settings
        </Button>
      </div>
    </div>
  )
}
