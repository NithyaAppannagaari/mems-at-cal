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
    "w-full bg-[var(--box-bg)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--foreground)]/50 py-3 px-4 text-sm font-serif transition-colors"

  return (
    <div className="w-full">
      <div className="flex gap-6 mb-8">
        {(["login", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); setSuccess(null) }}
            className={[
              "font-sans text-xs tracking-[0.3em] uppercase transition-colors pb-1",
              tab === t
                ? "text-[var(--foreground)] border-b border-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {t === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block font-sans text-[10px] tracking-[0.4em] uppercase text-[var(--muted)] mb-2">
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
          <label className="block font-sans text-[10px] tracking-[0.4em] uppercase text-[var(--muted)] mb-2">
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
          <p className="font-serif text-xs text-red-700 tracking-wide">{error}</p>
        )}
        {success && (
          <p className="font-serif text-xs text-[var(--accent)] tracking-wide">{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="text-left font-sans text-lg text-[var(--foreground)] hover:text-[var(--accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 mt-2"
        >
          <span>{loading ? "…" : tab === "login" ? "Enter" : "Create account"}</span>
          {!loading && <span className="text-[var(--muted)]">→</span>}
        </button>
      </form>
    </div>
  )
}
