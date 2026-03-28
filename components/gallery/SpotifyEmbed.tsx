"use client"

interface SpotifyEmbedProps {
  embedUrl: string
  autoplay: boolean
  memoryId: string
}

export function SpotifyEmbed({ embedUrl, autoplay, memoryId }: SpotifyEmbedProps) {
  const src = autoplay ? `${embedUrl}&autoplay=1` : embedUrl

  return (
    <iframe
      key={`${memoryId}-${autoplay ? "playing" : "idle"}`}
      src={src}
      width="100%"
      height="80"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="Spotify player"
      className="rounded-xl"
    />
  )
}
