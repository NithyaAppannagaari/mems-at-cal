import { cn } from "@/lib/utils/cn"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline"
  size?: "sm" | "md"
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2.5 text-sm",
        variant === "primary" && "bg-[var(--film-sepia)] text-white hover:bg-[var(--film-warm)]",
        variant === "ghost" && "text-[var(--film-dusk)] hover:bg-[var(--film-mist)]/50",
        variant === "outline" && "border border-[var(--film-mist)] text-[var(--film-dusk)] hover:bg-[var(--film-mist)]/50",
        className
      )}
    >
      {children}
    </button>
  )
}
