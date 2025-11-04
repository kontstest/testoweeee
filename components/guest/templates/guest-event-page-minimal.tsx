"use client"
import { useState } from "react"
import type { Event } from "@/lib/types/database"
import { Button } from "@/components/ui/button-wedding"
import { Camera, Upload, Calendar, MenuIcon, Grid3x3, ListChecks, X, Users } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { PhotoGalleryModule } from "../modules/photo-gallery-module"
import { ScheduleModule } from "../modules/schedule-module"
import { MenuModule } from "../modules/menu-module"
import { SurveyModule } from "../modules/survey-module"
import { BingoModule } from "../modules/bingo-module"
import { VendorsModule } from "../modules/vendors-module"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/lib/hooks/use-language"
import { translations } from "@/lib/i18n/translations"

interface GuestEventPageProps {
  event: Event
}

export function GuestEventPageMinimal({ event }: GuestEventPageProps) {
  const [activeView, setActiveView] = useState<string | null>(null)
  const { language } = useLanguage()
  const isWedding = event.event_type === "wedding"
  const t = translations[language][isWedding ? "wedding" : "event"]

  const primaryColor = event.primary_color || "#000000"
  const secondaryColor = event.secondary_color || "#666666"
  const contentBackgroundColor = event.content_background_color || "#ffffff"

  const showHeroImage = event.show_hero_image !== false
  const showBackgroundImage = event.show_background_image !== false

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

  return (
    <div
      className="min-h-screen py-12 px-4 relative overflow-hidden"
      style={{ backgroundColor: contentBackgroundColor }}
    >
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {showBackgroundImage && event.background_image_url && (
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
        {showHeroImage && event.hero_image_url && (
          <div className="px-6 py-8">
            <div className="relative w-full aspect-[2/3] mx-auto max-w-md">
              <img
                src={event.hero_image_url || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-full object-cover rounded-lg"
                style={{
                  objectPosition: event.hero_image_position || "center center",
                }}
              />
            </div>
          </div>
        )}

        <div className="border-l-4 pl-8 py-12" style={{ borderColor: primaryColor }}>
          <h1
            className="mb-4"
            style={{
              fontFamily: "var(--font-script)",
              fontSize: "3rem",
              color: primaryColor,
            }}
          >
            {event.name}
          </h1>
          <p className="text-sm tracking-widest" style={{ color: secondaryColor }}>
            {new Date(event.event_date).toLocaleDateString(language === "pl" ? "pl-PL" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!activeView && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 py-12"
            >
              {enabledSections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="border-b border-gray-200 pb-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-light" style={{ color: primaryColor }}>
                        {section.title}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: secondaryColor }}>
                        {section.description}
                      </p>
                    </div>
                    <section.icon className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                  </div>
                  <Button
                    onClick={() => setActiveView(section.viewId)}
                    className="text-sm px-6 py-2 rounded-none border-b-2"
                    style={{
                      backgroundColor: "transparent",
                      color: primaryColor,
                      borderColor: primaryColor,
                    }}
                  >
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-12"
            >
              <Button
                onClick={() => setActiveView(null)}
                variant="outline"
                className="mb-8 rounded-none border-b-2"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                <X className="w-4 h-4 mr-2" />
                {t.back}
              </Button>

              {(activeView === "gallery" || activeView === "gallery-view") && (
                <PhotoGalleryModule eventId={event.id} primaryColor={primaryColor} />
              )}
              {activeView === "vendors" && <VendorsModule eventId={event.id} primaryColor={primaryColor} />}
              {activeView === "schedule" && <ScheduleModule eventId={event.id} primaryColor={primaryColor} />}
              {activeView === "menu" && <MenuModule eventId={event.id} primaryColor={primaryColor} />}
              {activeView === "bingo" && <BingoModule eventId={event.id} primaryColor={primaryColor} />}
              {activeView === "survey" && <SurveyModule eventId={event.id} primaryColor={primaryColor} />}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-l-4 pl-8 py-12 mt-12" style={{ borderColor: primaryColor }}>
          <p
            className="mb-2"
            style={{
              fontFamily: "var(--font-script)",
              fontSize: "1.8rem",
              color: primaryColor,
            }}
          >
            {t.thanks}
          </p>
          <p className="text-sm" style={{ color: secondaryColor }}>
            {t.thanksDesc}
          </p>
        </div>
      </div>
    </div>
  )
}
