import { createRealtimeToken } from "@/lib/openai/realtimeToken"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const client_secret = await createRealtimeToken()
    return Response.json({ client_secret, valid: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message, valid: false }, { status: 500 })
  }
}
