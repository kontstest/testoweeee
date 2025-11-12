import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser, verifyEventOwnership, isSuperAdmin } from "@/lib/api/auth-utils"

// PUT /api/events/[eventId]/menu/[itemId] - Update menu item
export async function PUT(request: NextRequest, { params }: { params: Promise<{ eventId: string; itemId: string }> }) {
  try {
    const { eventId, itemId } = await params
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
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("menu_items")
      .update(body)
      .eq("id", itemId)
      .eq("event_id", eventId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/events/[eventId]/menu/[itemId] - Delete menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; itemId: string }> },
) {
  try {
    const { eventId, itemId } = await params
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isOwner = await verifyEventOwnership(eventId, user.id)
    const isAdmin = await isSuperAdmin(user.id)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from("menu_items").delete().eq("id", itemId).eq("event_id", eventId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
