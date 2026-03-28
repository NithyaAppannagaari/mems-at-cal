import { cacheLife } from "next/cache"

export async function getSpotifyAccessToken(): Promise<string> {
  "use cache"
  cacheLife("hours")

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64")

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    throw new Error("Failed to fetch Spotify access token")
  }

  const data = await response.json()
  return data.access_token
}
