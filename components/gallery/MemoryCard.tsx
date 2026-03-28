"use client"

import Image from "next/image"
import { SpotifyEmbed } from "./SpotifyEmbed"
import { usePlayback } from "@/hooks/usePlayback"
import type { Memory } from "@/types"

interface MemoryCardProps {
  memory: Memory
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const { activeMemoryId, setActiveMemory } = usePlayback()
  const isPlaying = activeMemoryId === memory.id

  return (
    <article className="flex flex-col gap-3 fade-up card-glow">
      {/* Image */}
      <div className="w-full overflow-hidden rounded-xl">
        <Image
          src={memory.image_url}
          alt={memory.title ?? memory.song_name ?? "A memory"}
          width={0}
          height={0}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="w-full h-auto film-image block"
        />
      </div>

      {/* Caption */}
      <div className="px-1 flex flex-col gap-2">

        {/* Title — primary serif (Cormorant bold italic) */}
        {memory.title && (
          <p className="font-serif text-2xl text-[var(--film-cream)] leading-tight text-editorial">
            {memory.title}
          </p>
        )}

        {/* Song name — script font (Great Vibes) for emotional tone */}
        {memory.song_name && (
          <p
            className="font-script text-[var(--film-gold)] leading-none text-editorial"
            style={{ fontSize: "1.45rem" }}
          >
            ♪ {memory.song_name}
            {memory.artist && (
              <span className="font-sans text-xs font-medium not-italic text-[var(--film-dusk)] ml-2 tracking-wide">
                — {memory.artist}
              </span>
            )}
          </p>
        )}

        {/* Date — utility sans, small caps */}
        <p className="font-sans text-xs tracking-[0.22em] uppercase text-[var(--film-dusk)] text-editorial">
          {formatDate(memory.created_at)}
        </p>

        {/* Spotify */}
        {memory.spotify_embed_url && (
          <div>
            <button
              onClick={() => setActiveMemory(isPlaying ? null : memory.id)}
              className="font-sans text-xs tracking-[0.18em] uppercase text-[var(--film-dusk)] hover:text-[var(--film-cream)] transition-colors flex items-center gap-2 py-0.5 text-editorial"
              aria-label={isPlaying ? "Pause" : "Play song"}
            >
              <span className="text-[var(--film-sepia)] text-base">{isPlaying ? "▪" : "▶"}</span>
              {isPlaying ? "Now playing" : "Play on Spotify"}
            </button>
            {isPlaying && (
              <SpotifyEmbed
                embedUrl={memory.spotify_embed_url}
                autoplay={isPlaying}
                memoryId={memory.id}
              />
            )}
          </div>
        )}

        {/* Comment — serif italic for romantic/emotional tone */}
        <div className="flex items-start gap-2.5 pt-2 border-t border-[var(--film-cream)]/10">
          <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0 mt-1 opacity-80">
            <Image
              src={memory.commenter_avatar_url}
              alt={memory.commenter_name}
              fill
              className="object-cover"
              unoptimized={memory.commenter_avatar_url.endsWith(".svg")}
              sizes="20px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-sans text-[10px] tracking-[0.22em] uppercase text-[var(--film-dusk)] text-editorial">
              {memory.commenter_name}
            </span>
            {/* Comment in serif italic — alternating from the name above */}
            <p className="font-serif text-sm text-[var(--film-dusk)] mt-0.5 leading-snug text-editorial" style={{ fontWeight: 400 }}>
              {memory.comment_text}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
