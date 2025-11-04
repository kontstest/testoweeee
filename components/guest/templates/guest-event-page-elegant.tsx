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

export function GuestEventPageElegant({ event }: GuestEventPageProps) {
  const [activeView, setActiveView] = useState<string | null>(null)
  const { language } = useLanguage()
  const isWedding = event.event_type === "wedding"
  const t = translations[language][isWedding ? "wedding" : "event"]

  const primaryColor = event.primary_color || "#1f2937"
  const secondaryColor = event.secondary_color || "#d4af37"
  const contentBackgroundColor = event.content_background_color || "#ffffff"
  const backgroundColor = "#f5f3f0"

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

  const showHeroImage = event.show_hero_image !== false
  const showBackgroundImage = event.show_background_image !== false

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden" style={{ backgroundColor }}>
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {showBackgroundImage && event.background_image_url && (
        <div
          className="fixed inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${event.background_image_url})`,
            backgroundPosition: event.background_position || "center center",
            opacity: 0.15,
            zIndex: 0,
          }}
        />
      )}

      <div className="relative z-10 max-w-3xl mx-auto">
        <div
          className="rounded-sm overflow-hidden shadow-2xl border-8"
          style={{
            backgroundColor: contentBackgroundColor,
            borderColor: secondaryColor,
          }}
        >
          <div
            className="text-center py-16 px-8"
            style={{
              backgroundColor: primaryColor,
              backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
            }}
          >
            <h1
              className="mb-4"
              style={{
                fontFamily: "var(--font-script)",
                fontSize: "3.5rem",
                color: secondaryColor,
              }}
            >
              {event.name}
            </h1>
            <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: secondaryColor }} />
            <p style={{ color: secondaryColor, fontSize: "1.1rem", letterSpacing: "0.1em" }}>
              {new Date(event.event_date).toLocaleDateString(language === "pl" ? "pl-PL" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {showHeroImage && event.hero_image_url && (
            <div className="px-0 py-0">
              <img
                src={event.hero_image_url || "/placeholder.svg"}
                alt={event.name}
                className="w-full h-96 object-cover"
                style={{
                  objectPosition: event.hero_image_position || "center center",
                }}
              />
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
                className="px-8 py-12 grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                {enabledSections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="text-center p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <section.icon className="w-10 h-10 mx-auto mb-3" style={{ color: secondaryColor }} />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: primaryColor }}>
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                    <Button
                      onClick={() => setActiveView(section.viewId)}
                      className="w-full rounded-sm py-2 text-sm"
                      style={{
                        backgroundColor: section.isPrimary ? secondaryColor : "white",
                        color: section.isPrimary ? primaryColor : secondaryColor,
                        border: `1px solid ${secondaryColor}`,
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
                className="px-8 py-8"
              >
                <Button
                  onClick={() => setActiveView(null)}
                  variant="outline"
                  className="mb-6 rounded-sm"
                  style={{ color: secondaryColor, borderColor: secondaryColor }}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t.back}
                </Button>

                {(activeView === "gallery" || activeView === "gallery-view") && (
                  <PhotoGalleryModule eventId={event.id} primaryColor={secondaryColor} />
                )}
                {activeView === "vendors" && <VendorsModule eventId={event.id} primaryColor={secondaryColor} />}
                {activeView === "schedule" && <ScheduleModule eventId={event.id} primaryColor={secondaryColor} />}
                {activeView === "menu" && <MenuModule eventId={event.id} primaryColor={secondaryColor} />}
                {activeView === "bingo" && <BingoModule eventId={event.id} primaryColor={secondaryColor} />}
                {activeView === "survey" && <SurveyModule eventId={event.id} primaryColor={secondaryColor} />}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="text-center py-12 px-8 border-t"
            style={{
              backgroundColor: `${primaryColor}05`,
              borderColor: secondaryColor,
            }}
          >
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
            <p className="text-sm" style={{ color: primaryColor }}>
              {t.thanksDesc}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
