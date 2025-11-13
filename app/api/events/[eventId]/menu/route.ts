import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getAuthUser, verifyEventOwnership, isSuperAdmin, isEventAccessible } from "@/lib/api/auth-utils"

// GET /api/events/[eventId]/menu - Get menu items (public)
export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params

    const accessible = await isEventAccessible(eventId)
    if (!accessible) {
      return NextResponse.json({ error: "Event not accessible" }, { status: 403 })
    }

    const result = await query((client) =>
      client.from("menu_items").select("*").eq("event_id", eventId).order("order_index", { ascending: true }),
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/events/[eventId]/menu - Create menu item (client/admin)
export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isOwner = await verifyEventOwnership(eventId, user.id)
    const isAdmin = await isSuperAdmin(user.id)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    const result = await query((client) =>
      client
        .from("menu_items")
        .insert({
          event_id: eventId,
          name: body.name,
          name_en: body.name_en,
          description: body.description,
          description_en: body.description_en,
          category: body.category,
          order_index: body.order_index || 0,
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
