import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/client"
import { getUser } from "@/lib/api/auth-utils"
import { randomUUID } from "crypto"
import { createSupabaseClient } from "@/lib/supabase/server"

/**
 * GET /api/events/[eventId]/photos
 * Zwraca listę zdjęć dla danego eventu
 */
export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const { eventId } = params

    const result = await query((client) =>
      client
        .from("photos")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
    )

    if (result.error) {
      console.error("[v0] Photos GET query error:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json(result.data) // tablica zdjęć
  } catch (error: any) {
    console.error("[v0] Photos GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/events/[eventId]/photos
 * Upload zdjęcia do Supabase Storage i zapis w bazie danych
 */
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

    // Konwersja File → Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const fileExt = file.name.split(".").pop() || "jpg"
    const filePath = `${eventId}/${user.id}/${randomUUID()}.${fileExt}`
    const supabase = createSupabaseClient()
    // Upload do Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("[v0] Supabase upload error:", uploadError)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    // Publiczny URL do zdjęcia
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
      })
    )

    if (result.error) {
      console.error("[v0] DB insert error:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Photos POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
