import { createClient } from "@/lib/supabase/server"

const SYSTEM_PROMPT = `The user is humming or singing a melody. Identify the song.
Respond with ONLY this JSON, nothing else:
{"song_name": "Song Title", "artist": "Artist Name"}
If you cannot identify it: {"song_name": null, "artist": null}`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { audio, format } = await request.json()
  if (!audio) return Response.json({ song_name: null, artist: null })

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-audio-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "input_audio", input_audio: { data: audio, format } },
              { type: "text", text: SYSTEM_PROMPT },
            ],
          },
        ],
      }),
    })

    if (!res.ok) return Response.json({ song_name: null, artist: null })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ""
    const parsed = JSON.parse(text)
    return Response.json(parsed)
  } catch {
    return Response.json({ song_name: null, artist: null })
  }
}
