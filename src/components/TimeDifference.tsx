import { Clock } from 'lucide-react'
import { getTimeDifferences } from '@/lib/country-timezones'

interface TimeDifferenceProps {
  countryCode: string
  accentColor: string
}

export function TimeDifference({ countryCode, accentColor }: TimeDifferenceProps) {
  const entries = getTimeDifferences(countryCode)
  if (entries.length === 0) return null

  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3"
      style={{ borderColor: accentColor + '40', backgroundColor: accentColor + '14' }}
    >
      <Clock className="mt-0.5 h-5 w-5 shrink-0" style={{ color: accentColor }} />
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wider text-[#1E2A44]/50">
          Time difference from NJ
        </div>
        {entries.length === 1 ? (
          <div className="text-sm font-semibold text-[#1E2A44]">
            {entries[0].text}{' '}
            <span className="text-[#1E2A44]/60">
              · {entries[0].localTime} local time
            </span>
          </div>
        ) : (
          <ul className="mt-0.5 space-y-0.5">
            {entries.map((e, i) => (
              <li key={i} className="text-sm text-[#1E2A44]">
                <span className="font-semibold">{e.text}</span>
                <span className="text-[#1E2A44]/60">
                  {' · '}{e.localTime} local time
                </span>
                {e.label && (
                  <span className="ml-1 text-[#1E2A44]/60">· {e.label}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
