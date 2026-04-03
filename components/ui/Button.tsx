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
        "font-sans font-medium rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2.5 text-sm",
        variant === "primary" && "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-white",
        variant === "ghost" && "text-[var(--muted)] hover:bg-[var(--box-bg)]",
        variant === "outline" && "border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--box-bg)]",
        className
      )}
    >
      {children}
    </button>
  )
}
