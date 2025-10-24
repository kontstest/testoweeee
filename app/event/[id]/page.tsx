import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GuestEventPage } from "@/components/guest/guest-event-page"

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch event details
  const { data: event, error } = await supabase.from("events").select("*").eq("id", id).single()

  if (error || !event) {
    notFound()
  }

  // Only show active events to guests
  if (event.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Event Not Available</h1>
          <p className="text-muted-foreground">This event is not currently active.</p>
        </div>
      </div>
    )
  }

  return <GuestEventPage event={event} />
}
