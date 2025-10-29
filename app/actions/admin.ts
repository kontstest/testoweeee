"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateEventInput {
  name: string
  eventDate: string
  eventType: "wedding" | "event"
  clientEmail: string
  clientFirstName: string
  clientLastName: string
  clientPassword: string
  modules: {
    photo_gallery: boolean
    schedule: boolean
    menu: boolean
    survey: boolean
    bingo: boolean
  }
}

export async function createEventWithClient(input: CreateEventInput) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "super_admin") {
      return { error: "Only super admins can create events" }
    }

    const adminClient = createAdminClient()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: input.clientEmail,
      password: input.clientPassword,
      email_confirm: true,
      user_metadata: {
        first_name: input.clientFirstName,
        last_name: input.clientLastName,
      },
    })

    if (authError) {
      console.error("[v0] Auth error:", authError)
      return { error: authError.message }
    }

    const { error: profileError } = await adminClient.from("profiles").upsert(
      {
        id: authData.user.id,
        role: "client",
        first_name: input.clientFirstName,
        last_name: input.clientLastName,
        email: input.clientEmail,
      },
      {
        onConflict: "id",
      },
    )

    if (profileError) {
      console.error("[v0] Profile error:", profileError)
      return { error: profileError.message }
    }

    const { data: eventData, error: eventError } = await adminClient
      .from("events")
      .insert({
        name: input.name,
        event_date: input.eventDate,
        client_id: authData.user.id,
        status: "draft",
        event_type: input.eventType,
        module_photo_gallery: input.modules.photo_gallery,
        module_schedule: input.modules.schedule,
        module_menu: input.modules.menu,
        module_survey: input.modules.survey,
        module_bingo: input.modules.bingo,
      })
      .select()
      .single()

    if (eventError) {
      console.error("[v0] Event error:", eventError)
      return { error: eventError.message }
    }

    revalidatePath("/admin")

    return {
      success: true,
      data: {
        event: eventData,
        clientEmail: input.clientEmail,
        clientPassword: input.clientPassword,
      },
    }
  } catch (error: any) {
    console.error("[v0] Unexpected error:", error)
    return { error: error.message || "Failed to create event" }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Unauthorized" }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "super_admin") {
      return { error: "Only super admins can delete events" }
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient.from("events").delete().eq("id", eventId)

    if (error) {
      console.error("[v0] Delete error:", error)
      return { error: error.message }
    }

    revalidatePath("/admin")

    return { success: true }
  } catch (error: any) {
    console.error("[v0] Unexpected error:", error)
    return { error: error.message || "Failed to delete event" }
  }
}
