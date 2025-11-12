// Database client abstraction - easy to switch from Supabase to any PostgreSQL
import { createClient } from "@/lib/supabase/server"

export async function getDbClient() {
  const supabase = await createClient()
  return supabase
}

// Helper to execute queries - can be replaced with pg, postgres.js, etc.
export async function query<T>(
  queryFn: (client: any) => Promise<{ data: T | null; error: any }>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const client = await getDbClient()
    const result = await queryFn(client)

    if (result.error) {
      console.error("[DB Error]", result.error)
      return { data: null, error: result.error.message }
    }

    return { data: result.data, error: null }
  } catch (error: any) {
    console.error("[DB Error]", error)
    return { data: null, error: error.message }
  }
}
