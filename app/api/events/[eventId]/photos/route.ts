import { type NextRequest, NextResponse } from "next/server"
import { query, supabase } from "@/lib/db/client"
import { getUser } from "@/lib/api/auth-utils"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const { eventId } = params
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get("file") as File | null
    const caption = (form.get("caption") as string) || null
    const wishes = (form.get("wishes") as string) || null
    const authorName = (form.get("author_name") as string) || null

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fileExt = file.name.split(".").pop() || "jpg"
    const filePath = `${eventId}/${user.id}/${randomUUID()}.${fileExt}`

    // ⬆️ Upload do Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    // Public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("photos").getPublicUrl(filePath)

    // Zapis do bazy danych
    const result = await query((client) =>
      client.from("photos").insert({
        event_id: eventId,
        uploaded_by: user.id,
        image_url: publicUrl,
        caption,
        wishes,
        author_name: authorName,
      }),
    )

    if (result.error) {
      console.error("DB insert error:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Photos POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
