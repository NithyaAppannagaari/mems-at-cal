"use client"

import { MemoryCard } from "./MemoryCard"
import type { Memory } from "@/types"

interface MemoryGridProps {
  memories: Memory[]
}

export function MemoryGrid({ memories }: MemoryGridProps) {
  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-start gap-2 py-16">
        <p className="font-serif text-3xl text-[var(--muted)]">no memories yet</p>
        <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[var(--muted)]/60">
          Add your first frame above
        </p>
      </div>
    )
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
      {memories.map((memory) => (
        <div key={memory.id} className="break-inside-avoid mb-10">
          <MemoryCard memory={memory} />
        </div>
      ))}
    </div>
  )
}
