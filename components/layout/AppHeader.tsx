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
      style={{ background: "linear-gradient(to bottom, rgba(192,221,218,0.96) 0%, transparent 100%)" }}
    >
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between pointer-events-auto">
        <h1 className="font-sans text-2xl text-[var(--foreground)] tracking-tight">
          memories @ cal
        </h1>
        <button
          onClick={handleLogout}
          className="font-sans text-2xl font-bold tracking-tight text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          exit
        </button>
      </div>
    </header>
  )
}
