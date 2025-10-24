import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientDashboard } from "@/components/client/client-dashboard"

export default async function ClientPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is client
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "client") {
    redirect("/")
  }

  // Fetch client's events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  return <ClientDashboard events={events || []} userId={user.id} />
}
