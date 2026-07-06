import { useEffect } from 'react'
import { ArrowLeft, X, MapPin, Thermometer } from 'lucide-react'
import type { CountryData, PopularPlace } from '@/data/countries'
import { TemperatureChart } from '@/components/TemperatureChart'
import { PlaceMap } from '@/components/PlaceMap'
import { getPlaceClimate } from '@/data/places-climate'

interface PlacePanelProps {
  place: PopularPlace
  country: CountryData
  onBack: () => void
  onClose: () => void
}

export function PlacePanel({ place, country, onBack, onClose }: PlacePanelProps) {
  const [primary, , tertiary] = country.flagColors
  const accent = primary === '#FFFFFF' ? tertiary : primary
  const secondaryAccent = tertiary === '#FFFFFF' ? primary : tertiary

  const lookup = getPlaceClimate(country.code, place.name)
  const coords = place.coords ?? lookup?.coords
  const temperatures = place.temperatures ?? lookup?.temperatures
  const precipitation = place.precipitation ?? lookup?.precipitation

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

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

        <p className="mb-6 text-sm leading-relaxed text-[#1E2A44]/80">
          {place.description}
        </p>

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
