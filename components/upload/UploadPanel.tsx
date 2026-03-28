"use client"

import { useState, useCallback } from "react"
import { ImageDropzone } from "./ImageDropzone"
import { HumRecorder } from "./HumRecorder"
import { SongResult } from "./SongResult"
import type { Memory, SongIdentificationResult } from "@/types"

interface UploadPanelProps {
  onMemoryCreated: (memory: Memory) => void
}

export function UploadPanel({ onMemoryCreated }: UploadPanelProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [songResult, setSongResult] = useState<SongIdentificationResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState("")

  const handleFileSelected = useCallback((file: File) => {
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  const handleSongIdentified = useCallback(async (result: SongIdentificationResult) => {
    if (result.song_name && result.artist) {
      try {
        const res = await fetch("/api/spotify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ song_name: result.song_name, artist: result.artist }),
        })
        const data = await res.json()
        setSongResult({ ...result, spotify_embed_url: data.spotify_embed_url ?? null })
      } catch {
        setSongResult(result)
      }
    } else {
      setSongResult(result)
    }
  }, [])

  const handleSongOverride = useCallback(async (result: SongIdentificationResult) => {
    if (result.song_name && result.artist) {
      try {
        const res = await fetch("/api/spotify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ song_name: result.song_name, artist: result.artist }),
        })
        const data = await res.json()
        setSongResult({ ...result, spotify_embed_url: data.spotify_embed_url ?? null })
      } catch {
        setSongResult(result)
      }
    } else {
      setSongResult(result)
    }
  }, [])

  async function handleSave() {
    if (!imageFile) return
    setUploading(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append("image", imageFile)
      if (title.trim()) fd.append("title", title.trim())
      if (songResult?.song_name) fd.append("song_name", songResult.song_name)
      if (songResult?.artist) fd.append("artist", songResult.artist)
      if (songResult?.spotify_embed_url) fd.append("spotify_embed_url", songResult.spotify_embed_url)

      const res = await fetch("/api/memories", { method: "POST", body: fd })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Upload failed")
      }
      const { memory } = await res.json()
      onMemoryCreated(memory)

      setImageFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setSongResult(null)
      setTitle("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  function handleReset() {
    setImageFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setSongResult(null)
    setTitle("")
    setError(null)
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="add a memory"
        maxLength={80}
        className="font-serif text-3xl text-[var(--film-cream)] bg-transparent border-0 border-b border-[var(--film-cream)]/25 focus:border-[var(--film-cream)]/60 focus:outline-none placeholder:text-[var(--film-dusk)] transition-colors w-full pb-1 text-editorial"
      />

      {/* Image */}
      <ImageDropzone onFileSelected={handleFileSelected} previewUrl={previewUrl} />

      {/* Audio + song — only after image is selected */}
      {imageFile && (
        <div className="flex flex-col gap-4">
          <div className="h-px bg-[var(--film-sepia)]/15" />

          <div className="flex flex-col items-center gap-3">
            <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[var(--film-dusk)] text-center">
              hum the melody — or skip
            </p>
            <HumRecorder onSongIdentified={handleSongIdentified} disabled={uploading} />
          </div>

          {songResult && (
            <SongResult result={songResult} onOverride={handleSongOverride} />
          )}
        </div>
      )}

      {error && (
        <p className="font-sans text-xs text-red-400/80 tracking-wide">
          {error}
        </p>
      )}

      {imageFile && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleReset}
            disabled={uploading}
            className="font-sans text-[10px] tracking-[0.3em] uppercase text-[var(--film-dusk)] hover:text-[var(--film-cream)] transition-colors disabled:opacity-40"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            className="font-sans text-sm text-[var(--film-cream)] hover:text-[var(--film-gold)] transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            <span>{uploading ? "Saving…" : "Save memory"}</span>
            {!uploading && <span className="text-[var(--film-sepia)]">→</span>}
          </button>
        </div>
      )}
    </div>
  )
}
