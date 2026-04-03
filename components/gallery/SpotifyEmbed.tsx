"use client"

interface SpotifyEmbedProps {
  embedUrl: string
  autoplay: boolean
  memoryId: string
}

export function SpotifyEmbed({ embedUrl, autoplay, memoryId }: SpotifyEmbedProps) {
  const src = `${embedUrl}&autoplay=${autoplay ? "1" : "0"}`

  return (
    <iframe
      key={memoryId}
      src={src}
      width="100%"
      height="80"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      referrerPolicy="no-referrer-when-downgrade"
      loading="lazy"
      title="Spotify player"
      className="rounded-xl"
    />
  )
}
