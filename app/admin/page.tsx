import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is super admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    redirect("/")
  }

  // Fetch all events
  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      profiles:client_id (
        email,
        first_name,
        last_name
      )
    `)
    .order("created_at", { ascending: false })

  return <AdminDashboard events={events || []} />
}
