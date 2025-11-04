"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Clock, CalendarIcon } from "lucide-react"
import { translations } from "@/lib/i18n/translations"
import type { ScheduleItem } from "@/lib/types/database"
import { useLanguage } from "@/lib/hooks/use-language"

interface ScheduleModuleProps {
  eventId: string
  primaryColor: string
}

export function ScheduleModule({ eventId, primaryColor }: ScheduleModuleProps) {
  const { language } = useLanguage()
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const t = translations[language].modules.schedule

  useEffect(() => {
    loadSchedule()
  }, [eventId, language])

  const loadSchedule = async () => {
    setIsLoading(true)

    const { data } = await supabase
      .from("schedule_items")
      .select("*")
      .eq("event_id", eventId)
      .order("time", { ascending: true })

    if (data) {
      setItems(data)
    }

    setIsLoading(false)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    return `${hours}:${minutes}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
            style={{ borderTopColor: primaryColor }}
          ></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t.noSchedule}</h3>
          <p className="text-muted-foreground">{t.notAdded}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: `${primaryColor}40` }}
        />

        <div className="space-y-6">
          {items.map((item, index) => {
            const displayTitle = language === "en" && item.title_en ? item.title_en : item.title
            const displayDescription = language === "en" && item.description_en ? item.description_en : item.description
            return (
              <div key={item.id} className="relative flex gap-3 md:gap-6 pl-12 md:pl-32">
                {/* Time badge */}
                <div className="absolute left-0 md:left-0 md:text-right md:w-24">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white font-semibold text-sm md:text-base"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Clock className="w-4 h-4" />
                    {formatTime(item.time)}
                  </div>
                </div>

                {/* Timeline dot */}
                <div
                  className="absolute left-8 md:left-8 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full border-4 border-white"
                  style={{ backgroundColor: primaryColor, top: "12px" }}
                />

                {/* Content */}
                <Card className="flex-1">
                  <CardContent className="pt-6">
                    <h3 className="text-lg md:text-xl font-semibold mb-2">{displayTitle}</h3>
                    {displayDescription && (
                      <p className="text-muted-foreground text-sm md:text-base">{displayDescription}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
