"use client"

interface SlideshowControlsProps {
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  currentIndex: number
  total: number
}

export function SlideshowControls({
  onPrev,
  onNext,
  onClose,
  currentIndex,
  total,
}: SlideshowControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-5 bg-gradient-to-t from-black/50 to-transparent">
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous memory"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Counter */}
      <span className="text-white/80 text-sm font-medium">
        {currentIndex + 1} / {total}
      </span>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={currentIndex === total - 1}
        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next memory"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-0 right-4 -translate-y-full mb-2 mt-[-48px] w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all"
        aria-label="Close slideshow"
        style={{ top: -52 }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
