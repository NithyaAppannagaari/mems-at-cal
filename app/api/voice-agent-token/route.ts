import { createClient } from "@/lib/supabase/server"

const SYSTEM_PROMPT = `You are a warm, friendly voice assistant living inside "memories @ cal" — a personal photo memory app for UC Berkeley students and alumni.

You help users reminisce, caption their photos, recall moments, and navigate their memories. Keep responses concise and conversational since this is a voice interface. Speak naturally, like a friend.`

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const res = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "alloy",
      instructions: SYSTEM_PROMPT,
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 600,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return Response.json({ error: err }, { status: 500 })
  }

  const data = await res.json()
  return Response.json({ client_secret: data.client_secret.value })
}
