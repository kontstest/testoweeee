import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params

    const result = await query((client) => client.from("survey_cards").select("*").eq("event_id", eventId).single())

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
    const body = await request.json()

    const result = await query((client) =>
      client.from("survey_responses").insert({
        event_id: eventId,
        survey_card_id: body.survey_card_id,
        responses: body.responses,
        guest_name: body.guest_name,
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
