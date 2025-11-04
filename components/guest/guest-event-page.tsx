"use client"
import type { Event } from "@/lib/types/database"
import { GuestEventPageClassic } from "./templates/guest-event-page-classic"
import { GuestEventPageElegant } from "./templates/guest-event-page-elegant"
import { GuestEventPageColorful } from "./templates/guest-event-page-colorful"
import { GuestEventPageMinimal } from "./templates/guest-event-page-minimal"

interface GuestEventPageProps {
  event: Event
}

export function GuestEventPage({ event }: GuestEventPageProps) {
  const template = event.guest_template || "classic"

  const templates = {
    classic: GuestEventPageClassic,
    elegant: GuestEventPageElegant,
    colorful: GuestEventPageColorful,
    minimal: GuestEventPageMinimal,
  }

  const TemplateComponent = templates[template as keyof typeof templates] || GuestEventPageClassic

  return <TemplateComponent event={event} />
}
