import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePromotionsStore } from '@/stores/promotionsStore'

export default function PromotionalCarousel() {
  const ads = usePromotionsStore((s) => s.ads)
  const enabledAds = useMemo(
    () => ads.filter((a) => a.enabled).sort((a, b) => a.sort_order - b.sort_order),
    [ads]
  )
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const goTo = useCallback((index: number, dir: 'left' | 'right') => {
    if (isAnimating) return
    setDirection(dir)
    setIsAnimating(true)
    // Allow the exit animation frame, then switch
    timeoutRef.current = setTimeout(() => {
      setCurrent(index)
      // Small delay so the enter animation plays from the new position
      requestAnimationFrame(() => setIsAnimating(false))
    }, 420)
  }, [isAnimating])

  const next = useCallback(() => {
    goTo((current + 1) % enabledAds.length, 'right')
  }, [current, enabledAds.length, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + enabledAds.length) % enabledAds.length, 'left')
  }, [current, enabledAds.length, goTo])

  // Auto-rotate every 6s
  useEffect(() => {
    if (enabledAds.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [enabledAds.length, next])

  // Reset index if ads change
  useEffect(() => {
    setCurrent((prev) => Math.min(prev, enabledAds.length - 1))
  }, [enabledAds.length])

  // Cleanup timeout
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  if (enabledAds.length === 0) return null

  const ad = enabledAds[current]

  // Build the slide animation classes
  const slideClass = isAnimating
    ? direction === 'right'
      ? 'animate-carousel-exit-left'
      : 'animate-carousel-exit-right'
    : 'animate-carousel-enter'

  return (
    <>
      {/* Inline keyframes for the carousel animations */}
      <style>{`
        @keyframes carousel-enter {
          0% { opacity: 0; transform: scale(1.04) translateY(6px); filter: blur(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes carousel-exit-left {
          0% { opacity: 1; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(-5%) scale(0.97); filter: blur(3px); }
        }
        @keyframes carousel-exit-right {
          0% { opacity: 1; transform: translateX(0) scale(1); }
          100% { opacity: 0; transform: translateX(5%) scale(0.97); filter: blur(3px); }
        }
        .animate-carousel-enter {
          animation: carousel-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-carousel-exit-left {
          animation: carousel-exit-left 0.4s cubic-bezier(0.55, 0, 1, 0.45) forwards;
        }
        .animate-carousel-exit-right {
          animation: carousel-exit-right 0.4s cubic-bezier(0.55, 0, 1, 0.45) forwards;
        }
        @keyframes progress-bar {
          0% { width: 0; }
          100% { width: 100%; }
        }
      `}</style>

      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg ring-1 ring-black/5">
          <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {/* Image container — constrained to 50% height for sharper rendering */}
            <div className={`relative w-full h-36 sm:h-44 md:h-52 overflow-hidden ${slideClass}`}>
              <img
                src={ad.image_url}
                alt={ad.title}
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ imageRendering: 'auto', maxWidth: '50%', margin: '0 auto', transform: 'scale(2)', transformOrigin: 'center center' }}
              />
              {/* Soft vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-white font-semibold text-sm md:text-base drop-shadow-lg tracking-tight">
                    {ad.title}
                  </span>
                  <span className="ml-2.5 inline-flex items-center gap-1 bg-[#23e5db]/90 text-[#002f34] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm">
                    Promoted
                  </span>
                </div>
              </div>
            </div>
          </a>

          {/* Nav arrows — glass style */}
          {enabledAds.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/30 transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <ChevronLeft size={18} className="text-white drop-shadow" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/30 transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <ChevronRight size={18} className="text-white drop-shadow" />
              </button>
            </>
          )}

          {/* Dots — pill style with animated active indicator */}
          {enabledAds.length > 1 && (
            <div className="absolute bottom-[3.25rem] left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              {enabledAds.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault()
                    goTo(i, i > current ? 'right' : 'left')
                  }}
                  className="relative"
                >
                  <span
                    className={`block rounded-full transition-all duration-500 ease-out ${
                      i === current
                        ? 'w-5 h-2 bg-white shadow-sm'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                  {/* Progress indicator on active dot */}
                  {i === current && enabledAds.length > 1 && (
                    <span
                      className="absolute inset-0 rounded-full bg-[#23e5db]/50"
                      style={{ animation: 'progress-bar 6s linear', width: '100%' }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
