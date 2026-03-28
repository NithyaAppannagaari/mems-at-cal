"use client"

import { createContext, useContext, useState, useCallback } from "react"

interface PlaybackState {
  activeMemoryId: string | null
  setActiveMemory: (id: string | null) => void
}

const PlaybackContext = createContext<PlaybackState | null>(null)

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(null)

  const setActiveMemory = useCallback((id: string | null) => {
    setActiveMemoryId(id)
  }, [])

  return (
    <PlaybackContext.Provider value={{ activeMemoryId, setActiveMemory }}>
      {children}
    </PlaybackContext.Provider>
  )
}

export function usePlaybackContext() {
  const ctx = useContext(PlaybackContext)
  if (!ctx) throw new Error("usePlaybackContext must be used within PlaybackProvider")
  return ctx
}
