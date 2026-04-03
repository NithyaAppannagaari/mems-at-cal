"use client"

import { useState, useCallback } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { UploadPanel } from "@/components/upload/UploadPanel"
import { MemoryGrid } from "@/components/gallery/MemoryGrid"
import { Spinner } from "@/components/ui/Spinner"
import { Toast } from "@/components/ui/Toast"
import { useMemories } from "@/hooks/useMemories"
import type { Memory } from "@/types"

export default function AppPage() {
  const { memories, loading, error, addMemory } = useMemories()
  const [toast, setToast] = useState<string | null>(null)

  const handleMemoryCreated = useCallback(
    (memory: Memory) => {
      addMemory(memory)
      setToast("Memory saved")
    },
    [addMemory]
  )

  return (
    <div className="min-h-screen" style={{ background: "#C0DDDA" }}>
      <AppHeader />

      <main className="relative z-10 w-full max-w-screen-2xl mx-auto px-4 sm:px-8 pt-28 pb-20 flex flex-col gap-16">
        <div className="w-full sm:max-w-sm">
          <UploadPanel onMemoryCreated={handleMemoryCreated} />
        </div>

        <section aria-label="Your memories">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : error ? (
            <p className="font-sans text-xs tracking-widest uppercase text-[var(--foreground)]/60 py-8">{error}</p>
          ) : (
            <MemoryGrid memories={memories} />
          )}
        </section>
      </main>

{toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
