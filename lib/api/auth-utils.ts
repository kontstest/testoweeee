import { createClient } from "@/lib/supabase/server"

export { createClient }

export async function getUser() {
  return getAuthUser()
}

// Check if user is authenticated
export async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Check if user owns the event (client auth)
export async function verifyEventOwnership(eventId: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("events").select("client_id").eq("id", eventId).single()

  if (error || !data) return false
  return data.client_id === userId
}

// Check if user is super admin
export async function isSuperAdmin(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

  if (error || !data) return false
  return data.role === "super_admin"
}

// Check if event is accessible (public or user is owner/admin)
export async function isEventAccessible(eventId: string, userId?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("events").select("client_id, status").eq("id", eventId).single()

  if (error || !data) return false

  // If event is draft, only owner or admin can access
  if (data.status === "draft") {
    if (!userId) return false
    return data.client_id === userId || (await isSuperAdmin(userId))
  }

  // Active events are accessible to everyone
  return true
}
