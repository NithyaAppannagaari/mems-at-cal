import { getSpotifyAccessToken } from "./auth"

export async function searchSpotifyTrack(
  songName: string,
  artist: string
): Promise<string | null> {
  try {
    const token = await getSpotifyAccessToken()
    const query = encodeURIComponent(`track:${songName} artist:${artist}`)

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (!response.ok) return null

    const data = await response.json()
    const trackId = data.tracks?.items?.[0]?.id

    if (!trackId) return null

    return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`
  } catch {
    return null
  }
}
