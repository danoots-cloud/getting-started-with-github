import { useState } from 'react'
import type { CountryData, PopularPlace } from '@/data/countries'
import { TemperatureChart } from '@/components/TemperatureChart'
import { Flag } from '@/components/Flag'
import { AdvisoryBadge } from '@/components/AdvisoryBadge'
import { TimeDifference } from '@/components/TimeDifference'
import { PlacePanel } from '@/components/PlacePanel'
import { climateGlance } from '@/lib/place-climate'
import { getPlaceClimate } from '@/data/places-climate'
import {
  MapPin,
  Landmark,
  Thermometer,
  CalendarHeart,
  Camera,
  Film,
  Music,
  Star,
  Lightbulb,
  ShoppingBag,
  Plane,
  X,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import { travelRequirements, type TravelDifficulty } from '@/data/travel-requirements'



interface CountryPanelProps {
  country: CountryData
  onClose: () => void
}

function Section({
  title,
  icon: Icon,
  children,
  accentColor,
}: {
  title: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  children: React.ReactNode
  accentColor: string
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5" style={{ color: accentColor }} />
        <h3 className="text-lg font-semibold text-[#1E2A44]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1E2A44]/10 bg-[#FBF5EC]/75 px-4 py-2.5 shadow-sm shadow-[#F2A65A]/15 backdrop-blur-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-[#1E2A44]/50">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-[#1E2A44]">{value}</div>
    </div>
  )
}

const DIFFICULTY_META: Record<
  TravelDifficulty,
  { label: string; dot: string; bg: string; border: string }
> = {
  easy: {
    label: 'Easy',
    dot: '#2E8B57',
    bg: '#2E8B5714',
    border: '#2E8B5744',
  },
  moderate: {
    label: 'Some prep',
    dot: '#D68A2A',
    bg: '#F2A65A1F',
    border: '#F2A65A55',
  },
  'advance-prep': {
    label: 'Advance planning',
    dot: '#E86A5C',
    bg: '#E86A5C1A',
    border: '#E86A5C55',
  },
}

function stateDeptUrl(countryName: string): string {
  // travel.state.gov uses country name with spaces replaced by hyphens.
  const slug = countryName.replace(/\s+/g, '-')
  return `https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/${slug}.html`
}

function TravelRequirementsSection({
  countryCode,
  countryName,
  accentColor,
}: {
  countryCode: string
  countryName: string
  accentColor: string
}) {
  const req = travelRequirements[countryCode]
  if (!req) return null
  const meta = DIFFICULTY_META[req.difficulty]

  return (
    <Section title="Travel Requirements" icon={ShieldCheck} accentColor={accentColor}>
      <div
        className="rounded-xl border px-4 py-3"
        style={{ borderColor: meta.border, backgroundColor: meta.bg }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: meta.dot }}
            aria-hidden
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1E2A44]">
            {meta.label}
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-[#1E2A44]">{req.summary}</p>
        {req.notes && req.notes.length > 0 && (
          <ul className="mt-2 space-y-1">
            {req.notes.map((n, i) => (
              <li
                key={i}
                className="flex gap-2 text-xs leading-relaxed text-[#1E2A44]/70"
              >
                <span className="mt-0.5 shrink-0" style={{ color: meta.dot }}>
                  ·
                </span>
                {n}
              </li>
            ))}
          </ul>
        )}
        <a
          href={stateDeptUrl(countryName)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1E2A44]/70 underline decoration-dotted underline-offset-2 hover:text-[#1E2A44]"
        >
          Verify at travel.state.gov
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </Section>
  )
}

type Attraction = CountryData['attractions'][number]

export function CountryPanel({ country, onClose }: CountryPanelProps) {
  const [openPlace, setOpenPlace] = useState<PopularPlace | null>(null)
  const [openAttraction, setOpenAttraction] = useState<Attraction | null>(null)

  const [primary, , tertiary] = country.flagColors
  const accent = primary === '#FFFFFF' ? tertiary : primary
  const secondaryAccent = tertiary === '#FFFFFF' ? primary : tertiary

  // Reset drill-down when the selected country changes.
  if (openPlace && !country.popularPlaces.some((p) => p.name === openPlace.name)) {
    setOpenPlace(null)
  }
  if (
    openAttraction &&
    !country.attractions.some((a) => a.name === openAttraction.name)
  ) {
    setOpenAttraction(null)
  }

  return (
    <div className="animate-slideIn relative flex h-full flex-col overflow-hidden">

      <div
        className="relative px-6 pb-6 pt-5"
        style={{
          background: `linear-gradient(135deg, ${accent}E6, ${secondaryAccent}B3)`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-black/20 p-1.5 text-white/80 transition-colors hover:bg-black/40 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <Flag
            code={country.code}
            name={country.name}
            className="h-14 w-20 rounded-md object-cover shadow-lg ring-1 ring-white/40"
          />
          <div>
            <h2 className="font-display text-3xl font-semibold text-white drop-shadow-md">
              {country.name}
            </h2>
            <p className="text-sm font-medium text-white/90">
              {country.continent}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarGutter: 'stable' }}>
        <div className="mb-6 grid grid-cols-2 gap-2">
          <InfoBadge label="Capital" value={country.capital} />
          <InfoBadge label="Population" value={country.population} />
          <InfoBadge label="Currency" value={country.currency} />
          <InfoBadge
            label="Language"
            value={
              country.languages.length > 2
                ? country.languages.slice(0, 2).join(', ') + '...'
                : country.languages.join(', ')
            }
          />
        </div>

        <AdvisoryBadge countryCode={country.code} />

        <div
          className="mb-6 flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{ borderColor: accent + '40', backgroundColor: accent + '14' }}
        >
          <Plane className="h-5 w-5 shrink-0" style={{ color: accent }} />
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-[#1E2A44]/50">
              Flight from Newark (EWR)
            </div>
            <div className="text-sm font-semibold text-[#1E2A44]">
              {country.flightTimeFromEWR}
            </div>
          </div>
        </div>

        <TimeDifference countryCode={country.code} accentColor={accent} />

        <Section title="Climate by Month" icon={Thermometer} accentColor={accent}>
          <TemperatureChart
            temperatures={country.temperatures}
            precipitation={country.precipitation}
            accentColor={accent}
            secondaryColor={secondaryAccent}
          />
        </Section>

        <Section title="Best Time to Visit" icon={CalendarHeart} accentColor={accent}>
          <div
            className="rounded-xl border px-4 py-3 text-sm font-medium text-[#1E2A44]"
            style={{ borderColor: accent + '40', backgroundColor: accent + '1A' }}
          >
            {country.bestTimeToVisit}
          </div>
        </Section>

        <TravelRequirementsSection
          countryCode={country.code}
          countryName={country.name}
          accentColor={accent}
        />



        <Section title="Popular Places" icon={MapPin} accentColor={accent}>
          <div className="space-y-2">
            {country.popularPlaces.map((place) => {
              const lookup = getPlaceClimate(country.code, place.name)
              const temps = place.temperatures ?? lookup?.temperatures
              const precip = place.precipitation ?? lookup?.precipitation
              const glance = climateGlance(temps, precip)
              const hasDetail = !!(place.coords || lookup?.coords || temps)
              return (
                <button
                  key={place.name}
                  type="button"
                  onClick={() => setOpenPlace(place)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-[#1E2A44]/10 bg-[#FBF5EC]/75 px-4 py-3 text-left shadow-sm shadow-[#F2A65A]/15 transition-all hover:border-[#1E2A44]/25 hover:bg-[#FBF5EC] hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-[#1E2A44]">{place.name}</div>
                    <div className="mt-0.5 text-sm text-[#1E2A44]/65">
                      {place.description}
                    </div>
                    {glance && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#1E2A44]/60">
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: accent }}
                          aria-hidden
                        />
                        {glance}
                      </div>
                    )}
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      hasDetail ? 'text-[#1E2A44]/50' : 'text-[#1E2A44]/25'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </Section>


        <Section title="Top Attractions" icon={Camera} accentColor={accent}>
          <div className="space-y-2">
            {country.attractions.map((a) => {
              const formatVisitors = (n: number) => {
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
              const visitorText =
                a.annualVisitors !== undefined
                  ? `${formatVisitors(a.annualVisitors)} annual visitors${
                      a.annualVisitorsYear ? ` (${a.annualVisitorsYear})` : ''
                    }`
                  : null
              return (
                <div
                  key={a.name}
                  className="overflow-hidden rounded-xl border border-[#1E2A44]/10 bg-[#FBF5EC]/75 shadow-sm shadow-[#F2A65A]/15"
                >
                  {a.imageUrl && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-[#1E2A44]/5">
                      <img
                        src={a.imageUrl}
                        alt={a.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="px-4 py-3">
                    <div className="font-semibold text-[#1E2A44]">{a.name}</div>
                    <div className="mt-0.5 text-sm text-[#1E2A44]/65">
                      {a.description}
                    </div>
                    {visitorText && (
                      <div className="mt-1.5 text-xs font-medium text-[#1E2A44]/60">
                        {a.annualVisitorsSourceUrl ? (
                          <a
                            href={a.annualVisitorsSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-dotted underline-offset-2 hover:text-[#1E2A44]"
                          >
                            {visitorText}
                          </a>
                        ) : (
                          visitorText
                        )}
                      </div>
                    )}
                    {a.imageUrl && a.imageAttribution && (
                      <div className="mt-2 text-[10px] leading-tight text-[#1E2A44]/40">
                        {a.imagePageUrl ? (
                          <a
                            href={a.imagePageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#1E2A44]/70 hover:underline"
                          >
                            {a.imageAttribution}
                          </a>
                        ) : (
                          a.imageAttribution
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        <Section title="Famous Movies" icon={Film} accentColor={accent}>
          <div className="space-y-2">
            {country.famousMovies.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border border-[#1E2A44]/10 bg-[#FBF5EC]/75 px-4 py-3 shadow-sm shadow-[#F2A65A]/15"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-[#1E2A44]">
                    {m.title}
                  </span>
                  <span className="text-xs text-[#1E2A44]/50">({m.year})</span>
                </div>
                <div className="mt-0.5 text-sm text-[#1E2A44]/65">
                  {m.description}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Music & Bands" icon={Music} accentColor={accent}>
          <div className="flex flex-wrap gap-2">
            {country.popularMusic.map((m) => (
              <div
                key={m.name}
                className="rounded-full px-3.5 py-1.5 text-sm"
                style={{
                  backgroundColor: accent + '1F',
                  border: `1px solid ${accent}3D`,
                  color: '#1E2A44',
                }}
              >
                <span className="font-medium">{m.name}</span>
                <span className="ml-1 text-[#1E2A44]/50">· {m.genre}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Notable Figures" icon={Star} accentColor={accent}>
          <div className="grid grid-cols-2 gap-2">
            {country.celebrities.map((c) => (
              <div
                key={c.name}
                className="rounded-xl border border-[#1E2A44]/10 bg-[#FBF5EC]/75 px-3 py-2.5 text-center shadow-sm shadow-[#F2A65A]/15"
              >
                <div className="text-sm font-semibold text-[#1E2A44]">
                  {c.name}
                </div>
                <div className="text-xs text-[#1E2A44]/65">{c.field}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Popular Souvenirs" icon={ShoppingBag} accentColor={accent}>
          <div className="space-y-2">
            {country.popularSouvenirs.map((s) => (
              <div
                key={s.name}
                className="rounded-xl border border-[#1E2A44]/10 bg-[#FBF5EC]/75 px-4 py-3 shadow-sm shadow-[#F2A65A]/15"
              >
                <div className="font-semibold text-[#1E2A44]">{s.name}</div>
                <div className="mt-0.5 text-sm text-[#1E2A44]/65">
                  {s.description}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Government" icon={Landmark} accentColor={accent}>
          <p className="text-sm leading-relaxed text-[#1E2A44]/80">
            {country.government}
          </p>
        </Section>

        <Section title="Notable Facts" icon={Lightbulb} accentColor={accent}>
          <ul className="space-y-2">
            {country.notableFacts.map((fact, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm leading-relaxed text-[#1E2A44]/80"
              >
                <span style={{ color: accent }} className="mt-0.5 shrink-0">
                  ✦
                </span>
                {fact}
              </li>
            ))}
          </ul>
        </Section>

        <div className="pb-6" />
      </div>

      {openPlace && (
        <PlacePanel
          place={openPlace}
          country={country}
          onBack={() => setOpenPlace(null)}
          onClose={onClose}
        />
      )}
    </div>
  )
}

