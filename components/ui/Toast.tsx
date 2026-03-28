"use client"

import { useEffect } from "react"

interface ToastProps {
  message: string
  type?: "success" | "error"
  onDismiss: () => void
}

export function Toast({ message, type = "success", onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      role="alert"
      className={[
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 border backdrop-blur-sm font-sans text-[10px] tracking-[0.35em] uppercase max-w-xs text-center",
        type === "success"
          ? "bg-[var(--background)]/90 border-[var(--film-sepia)]/35 text-[var(--film-cream)]"
          : "bg-[var(--background)]/90 border-red-500/35 text-red-400",
      ].join(" ")}
    >
      {message}
    </div>
  )
}
