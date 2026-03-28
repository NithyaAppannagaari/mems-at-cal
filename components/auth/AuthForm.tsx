"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type Tab = "login" | "signup"

export function AuthForm() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    if (tab === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess("Check your email to confirm, then sign in.")
        setTab("login")
      }
    }

    setLoading(false)
  }

  const inputClass =
    "w-full bg-transparent border-0 border-b border-[var(--film-cream)]/30 text-[var(--film-cream)] placeholder:text-[var(--film-dusk)] focus:outline-none focus:border-[var(--film-cream)]/70 py-3 text-sm font-sans tracking-wide transition-colors text-editorial"

  return (
    <div className="w-full">
      {/* Tabs — Space Grotesk small caps */}
      <div className="flex gap-6 mb-8">
        {(["login", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); setSuccess(null) }}
            className={[
              "font-sans text-xs tracking-[0.3em] uppercase transition-colors pb-1 text-editorial",
              tab === t
                ? "text-[var(--film-cream)] border-b border-[var(--film-gold)]"
                : "text-[var(--film-dusk)] hover:text-[var(--film-cream)]",
            ].join(" ")}
          >
            {t === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block font-sans text-[10px] tracking-[0.4em] uppercase text-[var(--film-dusk)] mb-2 text-editorial">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@berkeley.edu"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block font-sans text-[10px] tracking-[0.4em] uppercase text-[var(--film-dusk)] mb-2 text-editorial">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={tab === "login" ? "current-password" : "new-password"}
            minLength={6}
            placeholder="··········"
            className={inputClass}
          />
        </div>

        {error && (
          <p className="font-sans text-xs text-red-200 tracking-wide text-editorial">{error}</p>
        )}
        {success && (
          <p className="font-sans text-xs text-[var(--film-gold)] tracking-wide text-editorial">{success}</p>
        )}

        {/* Submit — Cormorant italic for elegance */}
        <button
          type="submit"
          disabled={loading}
          className="text-left font-serif text-xl text-[var(--film-cream)] hover:text-[var(--film-gold)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 mt-2 text-editorial"
        >
          <span>{loading ? "…" : tab === "login" ? "Enter" : "Create account"}</span>
          {!loading && <span className="font-sans text-sm font-normal not-italic text-[var(--film-gold)]">→</span>}
        </button>
      </form>
    </div>
  )
}
