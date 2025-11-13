import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getAuthUser, verifyEventOwnership, isSuperAdmin } from "@/lib/api/auth-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params

    const result = await query((client) =>
      client.from("vendors").select("*").eq("event_id", eventId).order("created_at", { ascending: true }),
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

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
        .from("vendors")
        .insert({
          event_id: eventId,
          name: body.name,
          name_en: body.name_en,
          category: body.category,
          description: body.description,
          description_en: body.description_en,
          contact: body.contact,
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
