import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getAuthUser, verifyEventOwnership, isSuperAdmin } from "@/lib/api/auth-utils"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; vendorId: string }> },
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, vendorId } = await params
    const isOwner = await verifyEventOwnership(eventId, user.id)
    const isAdmin = await isSuperAdmin(user.id)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const result = await query((client) =>
      client.from("vendors").update(body).eq("event_id", eventId).eq("id", vendorId).select().single(),
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; vendorId: string }> },
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, vendorId } = await params
    const isOwner = await verifyEventOwnership(eventId, user.id)
    const isAdmin = await isSuperAdmin(user.id)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await query((client) => client.from("vendors").delete().eq("event_id", eventId).eq("id", vendorId))

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
