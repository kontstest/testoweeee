import { query } from "@/lib/db/client"

export async function getAuthUser() {
  // This will be called from middleware/auth pages that already have context
  // For API routes, we get user from request context
  return null
}

export { getAuthUser as getUser }

// Check if user owns the event (using abstraction layer)
export async function verifyEventOwnership(eventId: string, userId: string) {
  const { data, error } = await query(async (supabase) => 
    supabase.from("events").select("client_id").eq("id", eventId).single()
  )

  if (error || !data) return false
  return data.client_id === userId
}

export { verifyEventOwnership as isEventOwner }

// Check if user is super admin
export async function isSuperAdmin(userId: string) {
  const { data, error } = await query(async (supabase) =>
    supabase.from("profiles").select("role").eq("id", userId).single()
  )

  if (error || !data) return false
  return data.role === "super_admin"
}

// Check if event is accessible (public or user is owner/admin)
export async function isEventAccessible(eventId: string, userId?: string) {
  const { data, error } = await query(async (supabase) =>
    supabase.from("events").select("client_id, status").eq("id", eventId).single()
  )

  if (error || !data) return false

  // If event is draft, only owner or admin can access
  if (data.status === "draft") {
    if (!userId) return false
    return data.client_id === userId || (await isSuperAdmin(userId))
  }

  // Active events are accessible to everyone
  return true
}
