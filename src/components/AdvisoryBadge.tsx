import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { ExternalLink, ShieldAlert } from 'lucide-react'
import { getTravelAdvisories, type Advisory } from '@/lib/advisories.functions'

const LEVEL_STYLES: Record<Advisory['level'], { bg: string; border: string; dot: string; text: string }> = {
  1: { bg: '#E8F5EC', border: '#7FBF8C', dot: '#2E9F4A', text: '#1F5A2E' },
  2: { bg: '#FEF6E4', border: '#E9BE6F', dot: '#D48A1A', text: '#7A4B0B' },
  3: { bg: '#FDECE0', border: '#E89F6F', dot: '#D96B1F', text: '#7A3410' },
  4: { bg: '#FCE4E4', border: '#E08585', dot: '#C7302C', text: '#7A1414' },
}

export function AdvisoryBadge({ countryCode }: { countryCode: string }) {
  const fetchAdvisories = useServerFn(getTravelAdvisories)
  const { data } = useQuery({
    queryKey: ['travel-advisories'],
    queryFn: () => fetchAdvisories(),
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
  })

  const advisory = data?.[countryCode]
  if (!advisory) return null

  const s = LEVEL_STYLES[advisory.level]
  return (
    <a
      href={advisory.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-4 flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-all hover:-translate-y-0.5 hover:shadow-sm"
      style={{ backgroundColor: s.bg, borderColor: s.border, color: s.text }}
    >
      <ShieldAlert className="h-4 w-4 shrink-0" style={{ color: s.dot }} />
      <span className="min-w-0 flex-1 truncate">
        <span className="font-semibold">US Advisory · Level {advisory.level}</span>{' '}
        — {advisory.title}
      </span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </a>
  )
}
