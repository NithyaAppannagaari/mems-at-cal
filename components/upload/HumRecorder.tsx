"use client"

import { useEffect, useRef } from "react"
import { useWebRTC } from "@/hooks/useWebRTC"
import type { SongIdentificationResult } from "@/types"

interface HumRecorderProps {
  onSongIdentified: (result: SongIdentificationResult) => void
  disabled?: boolean
}

const BUTTON_LABEL: Record<string, string> = {
  idle: "identify song",
  connecting: "connecting…",
  listening: "stop recording",
  identifying: "identifying…",
  done: "done",
  error: "try again",
}

export function HumRecorder({ onSongIdentified, disabled }: HumRecorderProps) {
  const { status, logs, start, stopAudio, cancel } = useWebRTC(onSongIdentified)
  const isActive = status === "listening" || status === "connecting" || status === "identifying"
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  function handleClick() {
    if (status === "listening") stopAudio()
    else if (status === "connecting") cancel()
    else start()
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center gap-3">
        {/* Mic button */}
        <button
          onClick={handleClick}
          disabled={disabled || status === "identifying" || status === "done"}
          className={[
            "relative w-11 h-11 rounded-full border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0",
            isActive
              ? "border-[var(--accent)] bg-[var(--accent)]/10"
              : "border-[var(--border)] hover:border-[var(--foreground)]/40",
          ].join(" ")}
          aria-label={BUTTON_LABEL[status]}
        >
          {status === "listening" && (
            <span className="absolute inset-0 rounded-full animate-ping border border-[var(--accent)] opacity-30" />
          )}
          <svg
            className={["w-4 h-4 transition-colors", isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"].join(" ")}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm7 8a1 1 0 0 1 1 1 8 8 0 0 1-7 7.938V22h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-2.062A8 8 0 0 1 4 12a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z" />
          </svg>
        </button>

        <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-[var(--muted)]">
          {BUTTON_LABEL[status]}
        </span>
      </div>

      {/* Rolling log — only shown while active or just finished */}
      {logs.length > 0 && (
        <div className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)]/60 p-3 flex flex-col gap-1.5 max-h-36 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.ts} className="flex items-start gap-2">
              <span className={[
                "mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0",
                log.type === "success" ? "bg-green-600" :
                log.type === "error"   ? "bg-red-500" :
                                         "bg-[var(--muted)]",
              ].join(" ")} />
              <p className="font-sans text-[10px] tracking-wide text-[var(--foreground)]/80 leading-tight">
                {log.text}
              </p>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  )
}
