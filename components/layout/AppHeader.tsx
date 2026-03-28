"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function AppHeader() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header
      className="fixed top-0 z-40 w-full pointer-events-none"
      style={{ background: "linear-gradient(to bottom, rgba(110,138,158,0.92) 0%, transparent 100%)" }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between pointer-events-auto">
        <h1 className="font-serif text-2xl text-[var(--film-cream)] tracking-tight text-editorial">
          memories @ cal
        </h1>
        <button
          onClick={handleLogout}
          className="font-sans text-xs tracking-[0.35em] uppercase text-[var(--film-dusk)] hover:text-[var(--film-cream)] transition-colors text-editorial"
        >
          Exit
        </button>
      </div>
    </header>
  )
}
