import { useEffect } from 'react'
import { ArrowLeft, X, MapPin, Users, CalendarHeart } from 'lucide-react'
import type { CountryData } from '@/data/countries'

type Attraction = CountryData['attractions'][number]

interface AttractionPanelProps {
  attraction: Attraction
  country: CountryData
  onBack: () => void
  onClose: () => void
}

function formatVisitors(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '')}M`
  }
  if (n >= 1_000) {
    const v = n / 1_000
    return `${v >= 10 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, '')}K`
  }
  return n.toLocaleString()
}

export function AttractionPanel({
  attraction,
  country,
  onBack,
  onClose,
}: AttractionPanelProps) {
  const [primary, , tertiary] = country.flagColors
  const accent = primary === '#FFFFFF' ? tertiary : primary
  const secondaryAccent = tertiary === '#FFFFFF' ? primary : tertiary

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  const visitorText =
    attraction.annualVisitors !== undefined
      ? `${formatVisitors(attraction.annualVisitors)} annual visitors${
          attraction.annualVisitorsYear ? ` (${attraction.annualVisitorsYear})` : ''
        }`
      : null

  return (
    <div className="animate-slideIn absolute inset-0 z-10 flex h-full flex-col overflow-hidden bg-[#FBF5EC]">
      <div
        className="relative px-6 pb-5 pt-4"
        style={{
          background: `linear-gradient(135deg, ${accent}E6, ${secondaryAccent}B3)`,
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-black/40 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {country.name}
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-black/20 p-1.5 text-white/80 transition-colors hover:bg-black/40 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h2 className="font-display text-2xl font-semibold text-white drop-shadow-md">
            {attraction.name}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white/85">
            <MapPin className="h-3.5 w-3.5" />
            {country.name}
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ scrollbarGutter: 'stable' }}
      >
        {attraction.imageUrl && (
          <div className="mb-2">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-[#1E2A44]/10 bg-[#1E2A44]/5 shadow-sm shadow-[#F2A65A]/15">
              <img
                src={attraction.imageUrl}
                alt={attraction.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            {attraction.imageAttribution && (
              <div className="mt-1.5 text-[10px] leading-tight text-[#1E2A44]/45">
                {attraction.imagePageUrl ? (
                  <a
                    href={attraction.imagePageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#1E2A44]/75 hover:underline"
                  >
                    {attraction.imageAttribution}
                  </a>
                ) : (
                  attraction.imageAttribution
                )}
              </div>
            )}
          </div>
        )}

        <p className="mb-6 mt-4 text-sm leading-relaxed text-[#1E2A44]/80">
          {attraction.description}
        </p>

        {attraction.bestWeatherMonths && (
          <div
            className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3"
            style={{ borderColor: accent + '40', backgroundColor: accent + '14' }}
          >
            <CalendarHeart className="mt-0.5 h-5 w-5 shrink-0" style={{ color: accent }} />
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-[#1E2A44]/50">
                Most comfortable weather
              </div>
              <div className="text-sm font-semibold text-[#1E2A44]">
                {attraction.bestWeatherMonths}
              </div>
              {attraction.goodWeatherMonths && (
                <div className="mt-0.5 text-xs text-[#1E2A44]/60">
                  Also pleasant: {attraction.goodWeatherMonths}
                </div>
              )}
            </div>
          </div>
        )}


        {visitorText && (
          <div
            className="mb-6 flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{ borderColor: accent + '40', backgroundColor: accent + '14' }}
          >
            <Users className="h-5 w-5 shrink-0" style={{ color: accent }} />
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-[#1E2A44]/50">
                Annual Visitors
              </div>
              <div className="text-sm font-semibold text-[#1E2A44]">
                {attraction.annualVisitorsSourceUrl ? (
                  <a
                    href={attraction.annualVisitorsSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted underline-offset-2 hover:text-[#1E2A44]/70"
                  >
                    {visitorText}
                  </a>
                ) : (
                  visitorText
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  )
}
