import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, guestName } = body

    if (!eventId || !guestName) {
      return NextResponse.json({ error: "Missing eventId or guestName" }, { status: 400 })
    }

    // Check if event exists and is active
    const eventResult = await query((client) =>
      client.from("events").select("*").eq("id", eventId).eq("status", "active").single(),
    )

    if (eventResult.error || !eventResult.data) {
      return NextResponse.json({ error: "Event not found or not active" }, { status: 404 })
    }

    // Create or get guest session (stored in sessionStorage on client side)
    // This endpoint validates event access for guests
    return NextResponse.json({
      data: {
        eventId,
        guestName,
        accessGranted: true,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
