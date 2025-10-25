"use client"

import type React from "react"
import { useState } from "react"
import type { Event } from "@/lib/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon, Calendar, Menu, MessageSquare, Grid3x3, Sparkles } from "lucide-react"
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
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "schedule",
      name: "Schedule",
      icon: Calendar,
      enabled: event.module_schedule,
      description: "Event timeline",
      component: ScheduleModule,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "menu",
      name: "Menu",
      icon: Menu,
      enabled: event.module_menu,
      description: "Food & drinks",
      component: MenuModule,
      gradient: "from-orange-500 to-red-500",
    },
    {
      id: "survey",
      name: "Survey",
      icon: MessageSquare,
      enabled: event.module_survey,
      description: "Share feedback",
      component: SurveyModule,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "bingo",
      name: "Bingo",
      icon: Grid3x3,
      enabled: event.module_bingo,
      description: "Play & win",
      component: BingoModule,
      gradient: "from-yellow-500 to-amber-500",
    },
  ]

  const enabledModules = modules.filter((m) => m.enabled)
  const activeModuleData = modules.find((m) => m.id === activeModule)
  const ActiveModuleComponent = activeModuleData?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50" style={customStyles}>
      <div className="relative h-screen min-h-[600px] overflow-hidden">
        {event.hero_image_url ? (
          <div className="absolute inset-0">
            <img
              src={event.hero_image_url || "/placeholder.svg"}
              alt={event.name}
              className="w-full h-full object-cover scale-110 animate-subtle-zoom"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 animate-gradient"
            style={{
              background: `linear-gradient(135deg, ${event.primary_color} 0%, ${event.secondary_color} 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">Welcome to our celebration</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 text-balance drop-shadow-2xl tracking-tight">
              {event.name}
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 drop-shadow-lg font-light mb-8">
              {new Date(event.event_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-white/90 shadow-2xl text-lg px-8 py-6 rounded-full animate-bounce-subtle"
              onClick={() => {
                document.getElementById("modules")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Explore Event
            </Button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-scroll" />
          </div>
        </div>
      </div>

      <div id="modules" className="container mx-auto px-4 py-20">
        {activeModule && ActiveModuleComponent ? (
          <div className="animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => setActiveModule(null)}
              className="mb-8 hover:bg-white/50 backdrop-blur-sm"
            >
              ← Back to Menu
            </Button>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
              <ActiveModuleComponent eventId={event.id} primaryColor={event.primary_color} />
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Choose Your Experience
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore our interactive features and make this celebration unforgettable
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {enabledModules.map((module, index) => {
                const Icon = module.icon
                return (
                  <Card
                    key={module.id}
                    className={cn(
                      "group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2",
                      "bg-white/80 backdrop-blur-xl border-2 border-white/20 overflow-hidden",
                      "animate-fade-in-up",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setActiveModule(module.id)}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity",
                        module.gradient,
                      )}
                    />
                    <CardContent className="pt-8 pb-6 text-center relative">
                      <div
                        className={cn(
                          "w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center",
                          "bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-500",
                          module.gradient,
                        )}
                      >
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 group-hover:bg-clip-text transition-all">
                        {module.name}
                      </h3>
                      <p className="text-gray-600 text-lg">{module.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {enabledModules.length === 0 && (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-xl text-gray-500">No modules are currently available for this event.</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-xl mt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 font-medium">Powered by EventFlow</p>
          <p className="text-sm text-gray-400 mt-2">Creating unforgettable moments</p>
        </div>
      </div>
    </div>
  )
}
