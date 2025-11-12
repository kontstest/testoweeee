import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"

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
