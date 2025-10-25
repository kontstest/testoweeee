"use client"
import { useState } from "react"
import type { Event } from "@/lib/types/database"
import { Button } from "@/components/ui/button-wedding"
import { Camera, Upload, Calendar, MenuIcon, Grid3x3, ListChecks, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { PhotoGalleryModule } from "./modules/photo-gallery-module"
import { ScheduleModule } from "./modules/schedule-module"
import { MenuModule } from "./modules/menu-module"
import { SurveyModule } from "./modules/survey-module"
import { BingoModule } from "./modules/bingo-module"

interface GuestEventPageProps {
  event: Event
}

export function GuestEventPage({ event }: GuestEventPageProps) {
  const [activeView, setActiveView] = useState<string | null>(null)
  const backgroundColor = event.primary_color ? `${event.primary_color}15` : "#f8f4f0"
  const accentColor = event.secondary_color || event.primary_color || "#9333ea"

  const menuSections = [
    {
      title: "Pokaż nam jak się bawisz",
      description: "Prześlij zdjęcia i podziel się życzeniami",
      icon: Upload,
      buttonText: "Prześlij zdjęcia",
      viewId: "gallery",
      isPrimary: true,
      enabled: event.module_photo_gallery,
    },
    {
      title: "Aktualna galeria wydarzenia",
      description: "Zobacz wszystkie zdjęcia dodane przez gości",
      icon: Camera,
      buttonText: "Galeria zdjęć",
      viewId: "gallery-view",
      isPrimary: false,
      enabled: event.module_photo_gallery,
    },
    {
      title: "Tu zobaczysz harmonogram wydarzenia",
      description: "Pełny plan dnia - od ceremonii do końca",
      icon: Calendar,
      buttonText: "Harmonogram",
      viewId: "schedule",
      isPrimary: false,
      enabled: event.module_schedule,
    },
    {
      title: "Tu zobaczysz menu wydarzenia",
      description: "Zobacz co przygotowaliśmy dla Was",
      icon: MenuIcon,
      buttonText: "Menu",
      viewId: "menu",
      isPrimary: false,
      enabled: event.module_menu,
    },
    {
      title: "Atrakcje / Zabawy",
      description: "Weź udział w zabawach",
      icon: Grid3x3,
      buttonText: "Zagraj w BINGO",
      viewId: "bingo",
      isPrimary: false,
      enabled: event.module_bingo,
    },
    {
      title: "Wypełnij ankietę",
      description: "Pomóż nam uczynić ten dzień jeszcze lepszym",
      icon: ListChecks,
      buttonText: "Wypełnij ankietę",
      viewId: "survey",
      isPrimary: false,
      enabled: event.module_survey,
    },
  ]

  const enabledSections = menuSections.filter((s) => s.enabled)

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden" style={{ backgroundColor }}>
      {event.hero_image_url && (
        <div
          className="fixed inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${event.hero_image_url})`,
            backgroundPosition: event.hero_image_position || "center center",
            transform: "scale(1.2)", // Zoom effect
            filter: "blur(40px)", // Heavy blur
            opacity: 0.3, // Strong fog effect
            zIndex: 0,
          }}
        />
      )}

      {/* Main content box */}
      <div className="relative z-10 max-w-2xl mx-auto">
        <div
          className="bg-white/95 backdrop-blur-sm rounded-[3rem] overflow-hidden shadow-2xl"
          style={{
            outline: `4px solid ${accentColor}`,
            outlineOffset: "8px",
          }}
        >
          {/* Header */}
          <div className="text-center py-12 px-6" style={{ backgroundColor: `${accentColor}10` }}>
            <h1
              className="mb-2"
              style={{
                fontFamily: "var(--font-script)",
                fontSize: "4rem",
                color: accentColor,
                lineHeight: "1.2",
              }}
            >
              {event.name}
            </h1>
            <div className="w-32 h-1 mx-auto mb-4 rounded-full" style={{ backgroundColor: accentColor }} />
            <p className="text-gray-700">
              {new Date(event.event_date).toLocaleDateString("pl-PL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Hero Image - Gothic arch shape */}
          {event.hero_image_url && (
            <div className="px-6 py-8">
              <div className="relative w-full aspect-[2/3] mx-auto max-w-md">
                <div
                  className="absolute inset-0 overflow-hidden rounded-t-[10rem]"
                  style={{
                    outline: `4px solid ${accentColor}`,
                    outlineOffset: "6px",
                  }}
                >
                  <img
                    src={event.hero_image_url || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-full object-cover rounded-t-[10rem]"
                  />
                  <div
                    className="absolute inset-0 rounded-t-[10rem]"
                    style={{
                      background: `linear-gradient(to bottom, ${accentColor}20, transparent 30%, transparent 70%, ${accentColor}20)`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Menu Sections */}
          <AnimatePresence mode="wait">
            {!activeView && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-8 space-y-6"
              >
                {enabledSections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="text-center"
                  >
                    <div className="mb-3">
                      <h3
                        className="text-gray-800 mb-1"
                        style={{ fontSize: "1.4rem", fontFamily: "var(--font-serif)" }}
                      >
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                    <Button
                      onClick={() => setActiveView(section.viewId)}
                      className="max-w-xs w-full rounded-3xl py-6 transition-all hover:scale-105"
                      style={
                        section.isPrimary
                          ? {
                              backgroundColor: accentColor,
                              color: "white",
                            }
                          : {
                              backgroundColor: "white",
                              color: accentColor,
                              border: `2px solid ${accentColor}`,
                            }
                      }
                    >
                      <section.icon className="w-5 h-5 mr-2" />
                      {section.buttonText}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active View Content */}
          <AnimatePresence mode="wait">
            {activeView && (
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="mb-6"
                >
                  <Button
                    onClick={() => setActiveView(null)}
                    variant="outline"
                    className="rounded-2xl"
                    style={{ borderColor: accentColor, color: accentColor }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Powrót
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {(activeView === "gallery" || activeView === "gallery-view") && (
                    <PhotoGalleryModule eventId={event.id} primaryColor={accentColor} />
                  )}
                  {activeView === "schedule" && <ScheduleModule eventId={event.id} primaryColor={accentColor} />}
                  {activeView === "menu" && <MenuModule eventId={event.id} primaryColor={accentColor} />}
                  {activeView === "bingo" && <BingoModule eventId={event.id} primaryColor={accentColor} />}
                  {activeView === "survey" && <SurveyModule eventId={event.id} primaryColor={accentColor} />}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="text-center py-8 px-6" style={{ backgroundColor: `${accentColor}10` }}>
            <p
              className="mb-2"
              style={{
                fontFamily: "var(--font-script)",
                fontSize: "2rem",
                color: accentColor,
              }}
            >
              Dziękujemy
            </p>
            <p className="text-sm text-gray-600">że jesteście z nami w tym wyjątkowym dniu</p>
          </div>
        </div>
      </div>
    </div>
  )
}
