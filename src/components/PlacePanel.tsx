import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, X, MapPin, Thermometer, CalendarHeart, Sparkles } from 'lucide-react'
import type { CountryData, PopularPlace } from '@/data/countries'
import { TemperatureChart } from '@/components/TemperatureChart'
import { PlaceMap } from '@/components/PlaceMap'
import { getPlaceClimate } from '@/data/places-climate'
import { placeEntityIds } from '@/data/placeEntityIds'
import { getAttractionsForPlace } from '@/data/placeAttractionRelationships'

type Attraction = CountryData['attractions'][number]

interface PlacePanelProps {
  place: PopularPlace
  country: CountryData
  onBack: () => void
  onClose: () => void
  onOpenAttraction?: (attraction: Attraction) => void
}

const NAME_NORM = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

const RELATIONSHIP_LABELS: Record<string, string> = {
  in_place: 'In this area',
  in_place_or_immediate_area: 'In this area',
  existing_editorial_link: 'In this area',
  nearby: 'Nearby',
  nearby_or_day_trip: 'Nearby',
  day_trip: 'Popular excursion',
  researched_excursion_or_local_link: 'Popular excursion',
  regional_excursion: 'Regional excursion',
}

const CATEGORY_ORDER: Record<string, number> = {
  'In this area': 0,
  Nearby: 1,
  'Popular excursion': 2,
  'Regional excursion': 3,
}

interface ResolvedHighlight {
  attraction: Attraction
  label: string | null
  order: number
  index: number
}

export function PlacePanel({ place, country, onBack, onClose, onOpenAttraction }: PlacePanelProps) {
  const [primary, , tertiary] = country.flagColors
  const accent = primary === '#FFFFFF' ? tertiary : primary
  const secondaryAccent = tertiary === '#FFFFFF' ? primary : tertiary

  const lookup = getPlaceClimate(country.code, place.name)
  const coords = place.coords ?? lookup?.coords
  const temperatures = place.temperatures ?? lookup?.temperatures
  const precipitation = place.precipitation ?? lookup?.precipitation

  const [expanded, setExpanded] = useState(false)

  const highlights = useMemo<ResolvedHighlight[]>(() => {
    const entityId = placeEntityIds[country.code]?.[NAME_NORM(place.name)]
    if (!entityId) return []
    const rels = getAttractionsForPlace(entityId)
    if (!rels.length) return []
    const attractionsById = new Map<string, Attraction>()
    for (const a of country.attractions) {
      if (a.entityId) attractionsById.set(a.entityId, a)
    }
    const seen = new Set<string>()
    const list: ResolvedHighlight[] = []
    rels.forEach((rel, i) => {
      const attr = attractionsById.get(rel.attractionEntityId)
      if (!attr) return
      if (seen.has(rel.attractionEntityId)) return
      seen.add(rel.attractionEntityId)
      const label = RELATIONSHIP_LABELS[rel.relationshipType] ?? null
      const order = label ? CATEGORY_ORDER[label] : 4
      list.push({ attraction: attr, label, order, index: i })
    })
    list.sort((a, b) => a.order - b.order || a.index - b.index)
    return list
  }, [country.code, country.attractions, place.name])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  const visibleHighlights = expanded ? highlights : highlights.slice(0, 4)
  const hasMore = highlights.length > 4

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
            {place.name}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white/85">
            <MapPin className="h-3.5 w-3.5" />
            {country.name}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarGutter: 'stable' }}>
        {coords && (
          <div className="mb-6">
            <PlaceMap
              countryCode={country.code}
              coords={coords}
              accentColor={accent}
            />
          </div>
        )}

        {place.panelSummary && (
          <p className="mb-5 text-sm leading-relaxed text-[#1E2A44]/80">
            {place.panelSummary}
          </p>
        )}

        <p className="mb-6 text-sm leading-relaxed text-[#1E2A44]/80">
          {place.description}
        </p>

        {place.bestWeatherMonths && (
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
                {place.bestWeatherMonths}
              </div>
              {place.goodWeatherMonths && (
                <div className="mt-0.5 text-xs text-[#1E2A44]/60">
                  Also pleasant: {place.goodWeatherMonths}
                </div>
              )}
            </div>
          </div>
        )}

        {highlights.length > 0 && onOpenAttraction && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: accent }} />
              <h3 className="text-lg font-semibold text-[#1E2A44]">Nearby highlights</h3>
            </div>
            <ul className="flex flex-col gap-2.5">
              {visibleHighlights.map(({ attraction, label }) => (
                <li key={attraction.entityId ?? attraction.name}>
                  <button
                    onClick={() => onOpenAttraction(attraction)}
                    className="group flex w-full items-stretch gap-3 rounded-xl border border-[#1E2A44]/10 bg-white/60 p-2.5 text-left transition-colors hover:border-[#1E2A44]/20 hover:bg-white"
                  >
                    {attraction.imageUrl ? (
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#1E2A44]/5 sm:h-20 sm:w-28">
                        <img
                          src={attraction.imageUrl}
                          alt={attraction.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-16 w-24 shrink-0 rounded-lg sm:h-20 sm:w-28"
                        style={{ backgroundColor: accent + '22' }}
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold text-[#1E2A44]">
                          {attraction.name}
                        </div>
                        {label && (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                            style={{
                              backgroundColor: accent + '1F',
                              color: '#1E2A44',
                            }}
                          >
                            {label}
                          </span>
                        )}
                      </div>
                      {attraction.description && (
                        <div className="mt-0.5 line-clamp-2 text-xs text-[#1E2A44]/70">
                          {attraction.description}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {hasMore && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#1E2A44]/70 hover:text-[#1E2A44]"
              >
                {expanded ? 'Show fewer highlights' : `Show all highlights (${highlights.length})`}
              </button>
            )}
          </div>
        )}

        {temperatures && temperatures.length > 0 ? (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Thermometer className="h-5 w-5" style={{ color: accent }} />
              <h3 className="text-lg font-semibold text-[#1E2A44]">Climate by Month</h3>
            </div>
            <TemperatureChart
              temperatures={temperatures}
              precipitation={precipitation}
              accentColor={accent}
              secondaryColor={secondaryAccent}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#1E2A44]/15 bg-[#FBF5EC] px-4 py-6 text-center text-sm text-[#1E2A44]/55">
            Detailed climate data for this place is coming soon.
          </div>
        )}

        <div className="pb-6" />
      </div>
    </div>
  )
}
