import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getUser } from "@/lib/api/auth-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string; cardId: string }> }) {
  try {
    const { eventId, cardId } = await params
    const result = await query((client) =>
      client.from("survey_cards").select("*").eq("event_id", eventId).eq("id", cardId).single(),
    )
    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 })
    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ eventId: string; cardId: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { eventId, cardId } = await params
    const body = await request.json()

    const result = await query((client) =>
      client.from("survey_cards").update(body).eq("event_id", eventId).eq("id", cardId),
    )

    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 })
    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; cardId: string }> },
) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { eventId, cardId } = await params
    const result = await query((client) =>
      client.from("survey_cards").delete().eq("event_id", eventId).eq("id", cardId),
    )

    if (result.error) return NextResponse.json({ error: result.error }, { status: 500 })
    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
