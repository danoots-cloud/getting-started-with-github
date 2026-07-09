import { MONTH_NAMES, type AdvisoryPreference, type RecommendationFilters } from '@/lib/destinationRecommendations'
import { Compass, X } from 'lucide-react'

interface Props {
  filters: RecommendationFilters
  onChange: (next: RecommendationFilters) => void
  active: boolean
  onActivate: () => void
  onClear: () => void
  resultCount: number | null
  advisoriesLoading: boolean
}

const FLIGHT_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any flight time', value: null },
  { label: '4 hours', value: 4 },
  { label: '6 hours', value: 6 },
  { label: '8 hours', value: 8 },
  { label: '10 hours', value: 10 },
  { label: '12 hours', value: 12 },
]

export function RecommendationFilters({
  filters,
  onChange,
  active,
  onActivate,
  onClear,
  resultCount,
  advisoriesLoading,
}: Props) {
  const helper =
    filters.advisoryPreference === 'levels-1-2'
      ? 'Shows destinations at State Department advisory Levels 1–2.'
      : "Also includes Level 3 'Reconsider Travel' destinations."

  return (
    <section
      className="rounded-2xl border border-[#1E2A44]/10 bg-[#FBF5EC]/80 p-4 shadow-sm shadow-[#F2A65A]/15 backdrop-blur-sm sm:p-5"
      aria-labelledby="reco-heading"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-[#E86A5C]" />
          <h2 id="reco-heading" className="font-display text-lg font-semibold text-[#1E2A44] sm:text-xl">
            Where should I go?
          </h2>
        </div>
        {active && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-full border border-[#1E2A44]/20 bg-white/60 px-3 py-1 text-xs font-medium text-[#1E2A44] hover:bg-white"
          >
            <X className="h-3 w-3" /> Browse all countries
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#1E2A44]/60">
            Month of travel
          </span>
          <select
            value={filters.month}
            onChange={(e) => onChange({ ...filters, month: Number(e.target.value) })}
            className="w-full rounded-lg border border-[#1E2A44]/15 bg-white/80 px-3 py-2 text-sm text-[#1E2A44] focus:border-[#E86A5C] focus:outline-none"
          >
            {MONTH_NAMES.map((n, i) => (
              <option key={n} value={i + 1}>{n}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#1E2A44]/60">
            Max flight from EWR
          </span>
          <select
            value={filters.maxFlightHours ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                maxFlightHours: e.target.value === '' ? null : Number(e.target.value),
              })
            }
            className="w-full rounded-lg border border-[#1E2A44]/15 bg-white/80 px-3 py-2 text-sm text-[#1E2A44] focus:border-[#E86A5C] focus:outline-none"
          >
            {FLIGHT_OPTIONS.map((o) => (
              <option key={o.label} value={o.value ?? ''}>{o.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#1E2A44]/60">
            Travel advisory preference
          </span>
          <select
            value={filters.advisoryPreference}
            onChange={(e) =>
              onChange({ ...filters, advisoryPreference: e.target.value as AdvisoryPreference })
            }
            className="w-full rounded-lg border border-[#1E2A44]/15 bg-white/80 px-3 py-2 text-sm text-[#1E2A44] focus:border-[#E86A5C] focus:outline-none"
          >
            <option value="levels-1-2">Levels 1–2</option>
            <option value="include-level-3">Include Level 3</option>
          </select>
        </label>
      </div>

      <p className="mt-2 text-xs text-[#1E2A44]/65">{helper}</p>
      <p className="mt-1 text-[11px] text-[#1E2A44]/45">
        Level 4 &lsquo;Do Not Travel&rsquo; destinations are always excluded.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!active ? (
          <button
            onClick={onActivate}
            disabled={advisoriesLoading}
            className="rounded-full bg-[#E86A5C] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#E86A5C]/30 transition hover:bg-[#d55a4d] disabled:opacity-60"
          >
            {advisoriesLoading ? 'Loading advisories…' : 'Show recommendations'}
          </button>
        ) : (
          <span className="text-sm font-medium text-[#1E2A44]">
            {resultCount ?? 0} recommended {resultCount === 1 ? 'destination' : 'destinations'}
          </span>
        )}
      </div>
    </section>
  )
}
