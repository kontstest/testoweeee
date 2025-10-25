import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EventDetailsPage } from "@/components/admin/event-details-page"

export default async function AdminEventDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "super_admin") {
    redirect("/")
  }

  return <EventDetailsPage eventId={params.id} />
}
