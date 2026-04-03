import { AuthForm } from "./AuthForm"

export function AuthCard() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-6"
      style={{ background: "#C0DDDA" }}
    >
      <div className="relative z-10 w-full max-w-xs">

        <p
          className="font-script text-[var(--muted)] leading-none -mb-2"
          style={{ fontSize: "2rem" }}
        >
          a place for
        </p>

        <h1
          className="font-sans text-[var(--foreground)] leading-[0.88]"
          style={{ fontSize: "5rem" }}
        >
          memories
        </h1>

        <p className="font-sans text-xs tracking-[0.5em] uppercase text-[var(--muted)] mt-4">
          @ cal · since 2026
        </p>

        <div className="flex items-center gap-3 mt-10 mb-8">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span
            className="font-script text-[var(--muted)] leading-none"
            style={{ fontSize: "1.2rem" }}
          >
            enter
          </span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <AuthForm />
      </div>
    </div>
  )
}
