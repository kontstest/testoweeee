import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getUser } from "@/lib/api/auth-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params

    const result = await query((client) =>
      client.from("photos").select("*").eq("event_id", eventId).order("created_at", { ascending: false }),
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const result = await query((client) =>
      client.from("photos").insert({
        event_id: eventId,
        uploaded_by: user.id,
        image_url: body.image_url,
        caption: body.caption || null,
      }),
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
