import { cn } from "@/lib/utils/cn"

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-5 h-5 rounded-full border border-[var(--border)] border-t-[var(--foreground)]/60 animate-spin",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
