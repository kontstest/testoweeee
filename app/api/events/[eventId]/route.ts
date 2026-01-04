import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getAuthUser, verifyEventOwnership, isSuperAdmin, isEventAccessible } from "@/lib/api/auth-utils"

// GET /api/events/[eventId] - Get event details
export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const user = await getAuthUser()

    const accessible = await isEventAccessible(eventId, user?.id)
    if (!accessible) {
      return NextResponse.json({ error: "Event not accessible" }, { status: 403 })
    }

    const result = await query((client) => client.from("events").select("*").eq("id", eventId).single())

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/events/[eventId] - Update event (client or admin)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
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
        .from("events")
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)
        .select()
        .single(),
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/events/[eventId] - Delete event (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await isSuperAdmin(user.id)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - admins only" }, { status: 403 })
    }

    const result = await query((client) => client.from("events").delete().eq("id", eventId))

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
