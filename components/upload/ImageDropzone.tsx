"use client"

import { useCallback, useRef } from "react"
import Image from "next/image"

interface ImageDropzoneProps {
  onFileSelected: (file: File) => void
  previewUrl: string | null
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/gif"]

export function ImageDropzone({ onFileSelected, previewUrl }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|heic|gif)$/i)) return
      onFileSelected(file)
    },
    [onFileSelected]
  )

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (previewUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl group">
        <Image
          src={previewUrl}
          alt="Selected memory"
          width={0}
          height={0}
          className="w-full h-auto film-image block"
          unoptimized
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Change image"
        >
          <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/80 bg-black/50 px-2 py-1">
            Change
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="w-full aspect-[4/3] rounded-xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[var(--foreground)]/40 hover:brightness-95 transition-all"
      style={{ background: "#fff8e1" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label="Upload a photo"
    >
      <p className="font-sans text-base font-bold tracking-wide text-[var(--foreground)]">
        upload a new memory
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
