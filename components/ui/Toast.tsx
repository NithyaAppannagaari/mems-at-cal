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
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 border font-sans text-[10px] tracking-[0.35em] uppercase max-w-xs text-center rounded-lg",
        type === "success"
          ? "bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]"
          : "bg-[var(--background)] border-red-300 text-red-700",
      ].join(" ")}
    >
      {message}
    </div>
  )
}
