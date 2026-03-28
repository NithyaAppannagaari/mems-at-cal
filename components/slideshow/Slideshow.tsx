"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { SlideshowSlide } from "./SlideshowSlide"
import { SlideshowControls } from "./SlideshowControls"
import { usePlayback } from "@/hooks/usePlayback"
import type { Memory } from "@/types"

interface SlideshowProps {
  memories: Memory[]
  initialIndex: number
  onClose: () => void
}

export function Slideshow({ memories, initialIndex, onClose }: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const { setActiveMemory } = usePlayback()
  const touchStartX = useRef<number | null>(null)

  // Set active memory for playback
  useEffect(() => {
    const memory = memories[currentIndex]
    if (memory) setActiveMemory(memory.id)
    return () => setActiveMemory(null)
  }, [currentIndex, memories, setActiveMemory])

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, memories.length - 1))
  }, [memories.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0))
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext()
      else if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev, onClose])

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  const memory = memories[currentIndex]
  if (!memory) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Memory slideshow"
    >
      {/* Slides — render current ±1 for smooth transitions */}
      <div className="relative w-full h-full">
        <div
          key={memory.id}
          className="absolute inset-0 transition-opacity duration-500 opacity-100"
        >
          <SlideshowSlide memory={memory} isActive={true} />
        </div>
      </div>

      {/* Controls */}
      <SlideshowControls
        onPrev={goPrev}
        onNext={goNext}
        onClose={onClose}
        currentIndex={currentIndex}
        total={memories.length}
      />
    </div>
  )
}
