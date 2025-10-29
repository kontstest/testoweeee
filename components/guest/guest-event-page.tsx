"use client"
import { useState } from "react"
import type { Event } from "@/lib/types/database"
import { Button } from "@/components/ui/button-wedding"
import { Camera, Upload, Calendar, MenuIcon, Grid3x3, ListChecks, X, Users } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { PhotoGalleryModule } from "./modules/photo-gallery-module"
import { ScheduleModule } from "./modules/schedule-module"
import { MenuModule } from "./modules/menu-module"
import { SurveyModule } from "./modules/survey-module"
import { BingoModule } from "./modules/bingo-module"
import { VendorsModule } from "./modules/vendors-module"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/lib/hooks/use-language"
import { translations } from "@/lib/i18n/translations"

interface GuestEventPageProps {
  event: Event
}

export function GuestEventPage({ event }: GuestEventPageProps) {
  const [activeView, setActiveView] = useState<string | null>(null)
  const { language } = useLanguage()
  const isWedding = event.event_type === "wedding"
  const t = translations[language][isWedding ? "wedding" : "event"]

  const primaryColor = event.primary_color || "#9333ea"
  const secondaryColor = event.secondary_color || "#ec4899"
  const contentBackgroundColor = event.content_background_color || "#ffffff"
  const backgroundColor = `${primaryColor}15`

  const menuSections = [
    {
      title: t.uploadPhotos,
      description: t.uploadPhotosDesc,
      icon: Upload,
      buttonText: t.uploadButton,
      viewId: "gallery",
      isPrimary: true,
      enabled: event.module_photo_gallery && event.module_photo_gallery_visible,
    },
    {
      title: t.gallery,
      description: t.galleryDesc,
      icon: Camera,
      buttonText: t.galleryButton,
      viewId: "gallery-view",
      isPrimary: false,
      enabled: event.module_photo_gallery && event.module_photo_gallery_visible,
    },
    {
      title: t.schedule,
      description: t.scheduleDesc,
      icon: Calendar,
      buttonText: t.scheduleButton,
      viewId: "schedule",
      isPrimary: false,
      enabled: event.module_schedule && event.module_schedule_visible,
    },
    {
      title: t.menu,
      description: t.menuDesc,
      icon: MenuIcon,
      buttonText: t.menuButton,
      viewId: "menu",
      isPrimary: false,
      enabled: event.module_menu && event.module_menu_visible,
    },
    {
      title: t.bingo,
      description: t.bingoDesc,
      icon: Grid3x3,
      buttonText: t.bingoButton,
      viewId: "bingo",
      isPrimary: false,
      enabled: event.module_bingo && event.module_bingo_visible,
    },
    {
      title: t.survey,
      description: t.surveyDesc,
      icon: ListChecks,
      buttonText: t.surveyButton,
      viewId: "survey",
      isPrimary: false,
      enabled: event.module_survey && event.module_survey_visible,
    },
    {
      title: t.vendors,
      description: t.vendorsDesc,
      icon: Users,
      buttonText: t.vendorsButton,
      viewId: "vendors",
      isPrimary: false,
      enabled: isWedding && event.module_vendors_visible,
    },
  ]

  const enabledSections = menuSections.filter((s) => s.enabled)

  const hexToRgba = (hex: string, alpha = 0.95) => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden" style={{ backgroundColor }}>
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {event.background_image_url && (
        <div
          className="fixed inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${event.background_image_url})`,
            backgroundPosition: event.background_position || "center center",
            transform: "scale(1.2)",
            filter: `blur(${event.background_blur || 40}px) brightness(${event.background_brightness || 100}%)`,
            opacity: (event.background_opacity || 30) / 100,
            zIndex: 0,
          }}
        />
      )}

      <div className="relative z-10 max-w-2xl mx-auto">
        <div
          className="backdrop-blur-sm rounded-[3rem] overflow-hidden shadow-2xl"
          style={{
            backgroundColor: hexToRgba(contentBackgroundColor, 0.95),
            outline: `4px solid ${secondaryColor}`,
            outlineOffset: "8px",
          }}
        >
          <div className="text-center py-12 px-6" style={{ backgroundColor: `${primaryColor}10` }}>
            <h1
              className="mb-2"
              style={{
                fontFamily: "var(--font-script)",
                fontSize: "4rem",
                color: secondaryColor,
                lineHeight: "1.2",
              }}
            >
              {event.name}
            </h1>
            <div className="w-32 h-1 mx-auto mb-4 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <p className="text-gray-700">
              {new Date(event.event_date).toLocaleDateString(language === "pl" ? "pl-PL" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {event.hero_image_url && (
            <div className="px-6 py-8">
              <div className="relative w-full aspect-[2/3] mx-auto max-w-md">
                <div
                  className="absolute inset-0 overflow-hidden rounded-t-[10rem]"
                  style={{
                    outline: `4px solid ${secondaryColor}`,
                    outlineOffset: "6px",
                  }}
                >
                  <img
                    src={event.hero_image_url || "/placeholder.svg"}
                    alt={event.name}
                    className="w-full h-full object-cover rounded-t-[10rem]"
                    style={{
                      objectPosition: event.hero_image_position || "center center",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-t-[10rem]"
                    style={{
                      background: `linear-gradient(to bottom, ${secondaryColor}20, transparent 30%, transparent 70%, ${secondaryColor}20)`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

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
                              backgroundColor: secondaryColor,
                              color: "white",
                            }
                          : {
                              backgroundColor: "white",
                              color: secondaryColor,
                              border: `2px solid ${secondaryColor}`,
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
                    style={{ borderColor: secondaryColor, color: secondaryColor }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t.back}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {(activeView === "gallery" || activeView === "gallery-view") && (
                    <PhotoGalleryModule eventId={event.id} primaryColor={secondaryColor} />
                  )}
                  {activeView === "vendors" && <VendorsModule eventId={event.id} primaryColor={secondaryColor} />}
                  {activeView === "schedule" && <ScheduleModule eventId={event.id} primaryColor={secondaryColor} />}
                  {activeView === "menu" && <MenuModule eventId={event.id} primaryColor={secondaryColor} />}
                  {activeView === "bingo" && <BingoModule eventId={event.id} primaryColor={secondaryColor} />}
                  {activeView === "survey" && <SurveyModule eventId={event.id} primaryColor={secondaryColor} />}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center py-8 px-6" style={{ backgroundColor: `${primaryColor}10` }}>
            <p
              className="mb-2"
              style={{
                fontFamily: "var(--font-script)",
                fontSize: "2rem",
                color: secondaryColor,
              }}
            >
              {t.thanks}
            </p>
            <p className="text-sm text-gray-600">{t.thanksDesc}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
