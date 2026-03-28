import { searchSpotifyTrack } from "@/lib/spotify/search"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { song_name, artist } = body

  if (!song_name || !artist) {
    return Response.json({ error: "song_name and artist are required" }, { status: 400 })
  }

  const spotify_embed_url = await searchSpotifyTrack(song_name, artist)
  return Response.json({ spotify_embed_url })
}
