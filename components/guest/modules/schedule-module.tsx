"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Clock, CalendarIcon } from "lucide-react"
import type { ScheduleItem } from "@/lib/types/database"

interface ScheduleModuleProps {
  eventId: string
  primaryColor: string
}

export function ScheduleModule({ eventId, primaryColor }: ScheduleModuleProps) {
  const [items, setItems] = useState<ScheduleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadSchedule()
  }, [eventId])

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
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Schedule Available</h3>
          <p className="text-muted-foreground">The event organizer hasn't added a schedule yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Event Schedule</h2>
        <p className="text-muted-foreground">Here's what's happening throughout the day</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ backgroundColor: `${primaryColor}40` }} />

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="relative flex gap-6">
              {/* Time badge */}
              <div className="flex-shrink-0 w-32">
                <div
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Clock className="w-4 h-4" />
                  {formatTime(item.time)}
                </div>
              </div>

              {/* Timeline dot */}
              <div
                className="absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white"
                style={{ backgroundColor: primaryColor, top: "12px" }}
              />

              {/* Content */}
              <Card className="flex-1">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  {item.description && <p className="text-muted-foreground">{item.description}</p>}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
