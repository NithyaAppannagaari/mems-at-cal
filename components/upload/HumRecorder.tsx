"use client"

import { useCallback } from "react"
import { useWebRTC } from "@/hooks/useWebRTC"
import type { SongIdentificationResult } from "@/types"

interface HumRecorderProps {
  onSongIdentified: (result: SongIdentificationResult) => void
  disabled?: boolean
}

const STATUS_LABEL: Record<string, string> = {
  idle: "Identify song from hum",
  connecting: "Connecting…",
  listening: "Listening — stop when done",
  identifying: "Identifying…",
  done: "Done",
  error: "Try again",
}

export function HumRecorder({ onSongIdentified, disabled }: HumRecorderProps) {
  const handleResult = useCallback(
    (result: SongIdentificationResult) => onSongIdentified(result),
    [onSongIdentified]
  )

  const { status, start, stop, error } = useWebRTC(handleResult)
  const isActive = status === "listening" || status === "connecting" || status === "identifying"

  function handleClick() {
    if (isActive) stop()
    else start()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={disabled || status === "identifying"}
        className={[
          "relative w-11 h-11 rounded-full border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed",
          isActive
            ? "border-[var(--film-sepia)] bg-[var(--film-sepia)]/20"
            : "border-[var(--film-sepia)]/35 hover:border-[var(--film-sepia)]/70",
        ].join(" ")}
        aria-label={STATUS_LABEL[status]}
      >
        {status === "listening" && (
          <span className="absolute inset-0 rounded-full animate-ping border border-[var(--film-sepia)] opacity-30" />
        )}
        <svg
          className={["w-4 h-4 transition-colors", isActive ? "text-[var(--film-sepia)]" : "text-[var(--film-dusk)]"].join(" ")}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm7 8a1 1 0 0 1 1 1 8 8 0 0 1-7 7.938V22h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.062A8 8 0 0 1 4 12a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z" />
        </svg>
      </button>

      <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-[var(--film-dusk)] text-center">
        {STATUS_LABEL[status]}
      </p>

      {error && (
        <p className="font-sans text-[10px] text-red-400/70 text-center max-w-[180px]">{error}</p>
      )}
    </div>
  )
}
