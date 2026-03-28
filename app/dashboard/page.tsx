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
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #6E8A9E 0%, #637A65 42%, #A67C52 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <AppHeader />

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20 flex flex-col gap-16">
        <div className="lg:max-w-xs">
          <UploadPanel onMemoryCreated={handleMemoryCreated} />
        </div>

        <section aria-label="Your memories">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : error ? (
            <p className="font-sans text-xs tracking-widest uppercase text-red-200/80 py-8">{error}</p>
          ) : (
            <MemoryGrid memories={memories} />
          )}
        </section>
      </main>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
