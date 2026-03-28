import { cn } from "@/lib/utils/cn"

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-5 h-5 rounded-full border border-[var(--film-sepia)]/20 border-t-[var(--film-sepia)]/70 animate-spin",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
