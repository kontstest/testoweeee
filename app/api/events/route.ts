import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser, isSuperAdmin } from "@/lib/api/auth-utils"

// GET /api/events - List user's events or all events (admin)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const isAdmin = await isSuperAdmin(user.id)

    let query = supabase.from("events").select("*")

    if (!isAdmin) {
      query = query.eq("client_id", user.id)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("events")
      .insert({
        name: body.name,
        event_date: body.event_date,
        status: "draft",
        client_id: user.id,
        event_type: body.event_type || "event",
        primary_color: body.primary_color || "#8B5CF6",
        secondary_color: body.secondary_color || "#EC4899",
        content_background_color: body.content_background_color || "#FFFFFF",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
