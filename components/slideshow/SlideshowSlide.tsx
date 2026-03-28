"use client"

import Image from "next/image"
import { SpotifyEmbed } from "@/components/gallery/SpotifyEmbed"
import type { Memory } from "@/types"

interface SlideshowSlideProps {
  memory: Memory
  isActive: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function SlideshowSlide({ memory, isActive }: SlideshowSlideProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Full-screen image */}
      <div className="absolute inset-0">
        <Image
          src={memory.image_url}
          alt={memory.song_name ? `${memory.song_name} memory` : "A memory"}
          fill
          className="object-cover film-image"
          sizes="100vw"
          priority={isActive}
        />
        {/* Vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
          }}
          aria-hidden="true"
        />
        {/* Bottom gradient for controls */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Top info overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/40 to-transparent">
        <p className="text-white/60 text-xs font-medium tracking-wider uppercase">
          {formatDate(memory.created_at)}
        </p>
        {memory.title && (
          <p className="text-white font-serif text-2xl mt-1 drop-shadow leading-snug">
            {memory.title}
          </p>
        )}
        {memory.song_name && (
          <p className={`font-serif drop-shadow ${memory.title ? "text-white/70 text-base mt-0.5" : "text-white text-lg mt-1"}`}>
            {memory.song_name}
            {memory.artist && (
              <span className="text-white/60 text-sm font-sans ml-2">— {memory.artist}</span>
            )}
          </p>
        )}
      </div>

      {/* Bottom content overlay */}
      <div className="absolute bottom-20 left-0 right-0 px-6 flex flex-col gap-3">
        {/* Comment */}
        <div className="flex items-start gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/30">
            <Image
              src={memory.commenter_avatar_url}
              alt={memory.commenter_name}
              fill
              className="object-cover"
              unoptimized={memory.commenter_avatar_url.endsWith(".svg")}
              sizes="32px"
            />
          </div>
          <div className="flex-1">
            <p className="text-white/70 text-xs font-medium">{memory.commenter_name}</p>
            <p className="text-white text-sm mt-0.5 leading-relaxed drop-shadow">
              {memory.comment_text}
            </p>
          </div>
        </div>

        {/* Spotify embed */}
        {memory.spotify_embed_url && isActive && (
          <SpotifyEmbed
            embedUrl={memory.spotify_embed_url}
            autoplay={true}
            memoryId={memory.id}
          />
        )}
      </div>
    </div>
  )
}
