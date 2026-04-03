"use client"

import { useState } from "react"
import type { SongIdentificationResult } from "@/types"

interface SongResultProps {
  result: SongIdentificationResult | null
  onOverride: (result: SongIdentificationResult) => void
}

export function SongResult({ result, onOverride }: SongResultProps) {
  const [manualSong, setManualSong] = useState("")
  const [manualArtist, setManualArtist] = useState("")
  const [showManual, setShowManual] = useState(!result?.song_name)

  const hasSong = result?.song_name && result?.artist

  const inputClass =
    "w-full bg-[var(--box-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--foreground)]/50 py-2 px-3 text-sm font-serif transition-colors"

  if (hasSong && !showManual) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
        <p className="font-serif text-sm text-[var(--foreground)]">
          ♪ {result.song_name}
          <span className="text-[var(--muted)] font-sans font-normal not-italic text-xs ml-2">
            — {result.artist}
          </span>
        </p>
        <button
          onClick={() => setShowManual(true)}
          className="font-sans text-[9px] tracking-[0.25em] uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-colors ml-3 flex-shrink-0"
        >
          Change
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {result && !result.song_name && (
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">
          Couldn&apos;t identify — enter manually
        </p>
      )}
      <input
        type="text"
        value={manualSong}
        onChange={(e) => setManualSong(e.target.value)}
        placeholder="Song name"
        className={inputClass}
      />
      <input
        type="text"
        value={manualArtist}
        onChange={(e) => setManualArtist(e.target.value)}
        placeholder="Artist"
        className={inputClass}
      />
      <button
        onClick={() => {
          if (manualSong.trim() && manualArtist.trim()) {
            onOverride({ song_name: manualSong.trim(), artist: manualArtist.trim(), spotify_embed_url: null })
            setShowManual(false)
          }
        }}
        disabled={!manualSong.trim() || !manualArtist.trim()}
        className="text-left font-sans text-xs text-[var(--foreground)] hover:text-[var(--accent)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
      >
        Set song <span className="text-[var(--muted)]">→</span>
      </button>
    </div>
  )
}
