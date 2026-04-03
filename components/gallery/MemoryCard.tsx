"use client"

import Image from "next/image"
import { useState } from "react"
import { SpotifyEmbed } from "./SpotifyEmbed"
import { usePlayback } from "@/hooks/usePlayback"
import { useMemories } from "@/hooks/useMemories"
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
  const { removeMemory } = useMemories()
  const [deleting, setDeleting] = useState(false)
  const isPlaying = activeMemoryId === memory.id

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch("/api/memories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memory.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        console.error("Delete failed:", data.error)
        setDeleting(false)
        return
      }
      removeMemory(memory.id)
    } catch (err) {
      console.error("Delete error:", err)
      setDeleting(false)
    }
  }

  return (
    <article className="relative flex flex-col gap-3 fade-up card-glow group/card">
      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-[var(--background)] text-[var(--foreground)] text-xs font-bold flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-[var(--foreground)] hover:text-[var(--box-bg)] disabled:opacity-40"
        aria-label="Delete memory"
      >
        ×
      </button>

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

        {memory.title && (
          <p className="font-sans text-xl text-[var(--foreground)] leading-tight">
            {memory.title}
          </p>
        )}

        {memory.song_name && (
          <p className="font-serif text-[var(--accent)] leading-snug" style={{ fontSize: "1.1rem" }}>
            ♪ {memory.song_name}
            {memory.artist && (
              <span className="font-script text-xs text-[var(--muted)] ml-2">
                — {memory.artist}
              </span>
            )}
          </p>
        )}

        <p className="font-sans text-xs tracking-[0.22em] uppercase text-[var(--muted)]">
          {formatDate(memory.created_at)}
        </p>

        {memory.spotify_embed_url && (
          <div>
            <button
              onClick={() => setActiveMemory(isPlaying ? null : memory.id)}
              className="font-sans text-xs tracking-[0.18em] uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2 py-0.5"
              aria-label={isPlaying ? "Pause" : "Play song"}
            >
              <span className="text-[var(--accent)] text-base">{isPlaying ? "▪" : "▶"}</span>
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

        <div className="flex items-start gap-2.5 pt-2 border-t border-[var(--border)]">
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
            <span className="font-sans text-[10px] tracking-[0.22em] uppercase text-[var(--muted)]">
              {memory.commenter_name}
            </span>
            <p className="font-serif text-sm text-[var(--foreground)]/70 mt-0.5 leading-snug">
              {memory.comment_text}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
