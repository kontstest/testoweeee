import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getUser, isEventOwner } from "@/lib/api/auth-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only owner/admin can view responses
    const isOwner = await isEventOwner(user.id, eventId)
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await query((client) =>
      client
        .from("bingo_progress")
        .select("*, bingo_cards(*)")
        .eq("bingo_cards.event_id", eventId)
        .order("created_at", { ascending: false }),
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
