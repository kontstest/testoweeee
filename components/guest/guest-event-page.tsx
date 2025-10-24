"use client"

import type React from "react"

import { useState } from "react"
import type { Event } from "@/lib/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, Calendar, Menu, MessageSquare, Grid3x3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PhotoGalleryModule } from "./modules/photo-gallery-module"
import { ScheduleModule } from "./modules/schedule-module"
import { MenuModule } from "./modules/menu-module"
import { SurveyModule } from "./modules/survey-module"
import { BingoModule } from "./modules/bingo-module"

interface GuestEventPageProps {
  event: Event
}

export function GuestEventPage({ event }: GuestEventPageProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null)

  // Apply custom colors
  const customStyles = {
    "--event-primary": event.primary_color,
    "--event-secondary": event.secondary_color,
  } as React.CSSProperties

  const modules = [
    {
      id: "gallery",
      name: "Photo Gallery",
      icon: ImageIcon,
      enabled: event.module_photo_gallery,
      description: "Share your memories",
      component: PhotoGalleryModule,
    },
    {
      id: "schedule",
      name: "Schedule",
      icon: Calendar,
      enabled: event.module_schedule,
      description: "Event timeline",
      component: ScheduleModule,
    },
    {
      id: "menu",
      name: "Menu",
      icon: Menu,
      enabled: event.module_menu,
      description: "Food & drinks",
      component: MenuModule,
    },
    {
      id: "survey",
      name: "Survey",
      icon: MessageSquare,
      enabled: event.module_survey,
      description: "Share feedback",
      component: SurveyModule,
    },
    {
      id: "bingo",
      name: "Bingo",
      icon: Grid3x3,
      enabled: event.module_bingo,
      description: "Play & win",
      component: BingoModule,
    },
  ]

  const enabledModules = modules.filter((m) => m.enabled)
  const activeModuleData = modules.find((m) => m.id === activeModule)
  const ActiveModuleComponent = activeModuleData?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white" style={customStyles}>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {event.hero_image_url ? (
          <img
            src={event.hero_image_url || "/placeholder.svg"}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${event.primary_color} 0%, ${event.secondary_color} 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 text-balance drop-shadow-lg">{event.name}</h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
              {new Date(event.event_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {activeModule && ActiveModuleComponent ? (
          <div>
            <Button variant="outline" onClick={() => setActiveModule(null)} className="mb-6">
              ← Back to Menu
            </Button>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ActiveModuleComponent eventId={event.id} primaryColor={event.primary_color} />
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Welcome!</h2>
              <p className="text-lg text-muted-foreground">Choose an option below to get started</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {enabledModules.map((module) => {
                const Icon = module.icon
                return (
                  <Card
                    key={module.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-xl hover:scale-105",
                      "border-2 hover:border-[var(--event-primary)]",
                    )}
                    onClick={() => setActiveModule(module.id)}
                  >
                    <CardContent className="pt-6 text-center">
                      <div
                        className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${event.primary_color}20` }}
                      >
                        <Icon className="w-8 h-8" style={{ color: event.primary_color }} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{module.name}</h3>
                      <p className="text-muted-foreground">{module.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {enabledModules.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No modules are currently available for this event.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by EventFlow</p>
        </div>
      </div>
    </div>
  )
}
