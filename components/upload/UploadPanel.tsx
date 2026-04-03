"use client"

import { useState, useCallback, useEffect } from "react"
import { ImageDropzone } from "./ImageDropzone"
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

  // Revoke object URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileSelected = useCallback((file: File) => {
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [])

  // Single handler for both hum identification and manual override
  const handleSongResult = useCallback(async (result: SongIdentificationResult) => {
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

  function clearForm() {
    setImageFile(null)
    setPreviewUrl(null)
    setSongResult(null)
    setTitle("")
    setError(null)
  }

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
      clearForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="add a memory"
        maxLength={80}
        className="font-sans text-2xl text-[var(--foreground)] bg-transparent border-0 border-b border-[var(--border)] focus:border-[var(--foreground)]/50 focus:outline-none placeholder:text-[var(--muted)] transition-colors w-full pb-1"
      />

      <ImageDropzone onFileSelected={handleFileSelected} previewUrl={previewUrl} />

      {imageFile && (
        <div className="flex flex-col gap-4">
          <div className="h-px bg-[var(--border)]" />

          <SongResult result={songResult} onOverride={handleSongResult} />
        </div>
      )}

      {error && (
        <p className="font-serif text-xs text-red-700 tracking-wide">{error}</p>
      )}

      {imageFile && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={clearForm}
            disabled={uploading}
            className="font-sans text-[10px] tracking-[0.3em] uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-40"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            className="font-sans text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            <span>{uploading ? "Saving…" : "Save memory"}</span>
            {!uploading && <span className="text-[var(--muted)]">→</span>}
          </button>
        </div>
      )}
    </div>
  )
}
