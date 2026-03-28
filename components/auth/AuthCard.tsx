import { AuthForm } from "./AuthForm"

export function AuthCard() {
  return (
    <div
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(150deg, #6E8A9E 0%, #5F6F52 52%, #A67C52 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Soft warm light leak top-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-8%", right: "8%",
          width: "560px", height: "560px",
          background: "radial-gradient(circle, rgba(255,248,220,0.1) 0%, transparent 65%)",
          borderRadius: "50%",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-xs">

        {/* Script accent — Great Vibes */}
        <p
          className="font-script text-[var(--film-gold)] leading-none -mb-2 text-editorial"
          style={{ fontSize: "2.6rem" }}
        >
          a place for
        </p>

        {/* Main title — Cormorant Garamond bold italic */}
        <h1
          className="font-serif text-[var(--film-cream)] leading-[0.88] text-editorial"
          style={{ fontSize: "5.5rem" }}
        >
          memories
        </h1>

        {/* @ cal — Space Grotesk utility, small caps */}
        <p className="font-sans text-xs tracking-[0.5em] uppercase text-[var(--film-dusk)] mt-4 text-editorial">
          @ cal · since 2024
        </p>

        {/* Divider with script accent */}
        <div className="flex items-center gap-3 mt-10 mb-8">
          <div className="h-px flex-1 bg-[var(--film-cream)]/20" />
          <span
            className="font-script text-[var(--film-dusk)] leading-none text-editorial"
            style={{ fontSize: "1.3rem" }}
          >
            enter
          </span>
          <div className="h-px flex-1 bg-[var(--film-cream)]/20" />
        </div>

        <AuthForm />
      </div>
    </div>
  )
}
