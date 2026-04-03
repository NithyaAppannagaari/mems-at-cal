"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Memory } from "@/types"

interface MemoriesState {
  memories: Memory[]
  loading: boolean
  error: string | null
  addMemory: (memory: Memory) => void
  removeMemory: (id: string) => void
  refresh: () => Promise<void>
}

const MemoriesContext = createContext<MemoriesState | null>(null)

export function MemoriesProvider({ children }: { children: React.ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/memories")
      if (!res.ok) throw new Error("Failed to load memories")
      const data = await res.json()
      setMemories(data.memories ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  const addMemory = useCallback((memory: Memory) => {
    setMemories((prev) => [memory, ...prev])
  }, [])

  const removeMemory = useCallback((id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <MemoriesContext.Provider value={{ memories, loading, error, addMemory, removeMemory, refresh }}>
      {children}
    </MemoriesContext.Provider>
  )
}

export function useMemoriesContext() {
  const ctx = useContext(MemoriesContext)
  if (!ctx) throw new Error("useMemoriesContext must be used within MemoriesProvider")
  return ctx
}
