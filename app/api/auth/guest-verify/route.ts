import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
    }

    // Verify event exists and is active
    const result = await query((client) =>
      client.from("events").select("id, status").eq("id", eventId).eq("status", "active").single(),
    )

    if (result.error || !result.data) {
      return NextResponse.json({ error: "Event not found or not active" }, { status: 404 })
    }

    return NextResponse.json({ data: { valid: true } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
