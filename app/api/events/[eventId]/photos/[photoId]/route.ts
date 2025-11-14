import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getUser } from "@/lib/api/auth-utils"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; photoId: string }> },
) {
  try {
    const { photoId } = await params
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await query((client) => client.from("photos").delete().eq("id", photoId).eq("uploaded_by", user.id))

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
