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
    "w-full bg-transparent border-0 border-b border-[var(--film-sepia)]/25 text-[var(--film-cream)] placeholder:text-[var(--film-dusk)] focus:outline-none focus:border-[var(--film-sepia)]/60 py-2 text-sm font-sans transition-colors"

  if (hasSong && !showManual) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-[var(--film-sepia)]/15">
        <p className="font-serif text-sm text-[var(--film-cream)]">
          ♪ {result.song_name}
          <span className="text-[var(--film-dusk)] font-sans font-normal not-italic text-xs ml-2">
            — {result.artist}
          </span>
        </p>
        <button
          onClick={() => setShowManual(true)}
          className="font-sans text-[9px] tracking-[0.25em] uppercase text-[var(--film-dusk)] hover:text-[var(--film-cream)] transition-colors ml-3 flex-shrink-0"
        >
          Change
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {result && !result.song_name && (
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[var(--film-dusk)]">
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
        className="text-left font-sans text-xs text-[var(--film-cream)] hover:text-[var(--film-gold)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
      >
        Set song <span className="text-[var(--film-sepia)]">→</span>
      </button>
    </div>
  )
}
