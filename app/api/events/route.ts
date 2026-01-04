import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getAuthUser, isSuperAdmin } from "@/lib/api/auth-utils"

// GET /api/events - List user's events or all events (admin)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await isSuperAdmin(user.id)

    const result = await query((client) => {
      let q = client.from("events").select("*")

      if (!isAdmin) {
        q = q.eq("client_id", user.id)
      }

      return q
    })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
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

    const result = await query((client) =>
      client
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
        .single(),
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
