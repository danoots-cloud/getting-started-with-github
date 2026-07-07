import { createServerFn } from '@tanstack/react-start'
import { XMLParser } from 'fast-xml-parser'
import { countries } from '@/data/countries'

export interface Advisory {
  level: 1 | 2 | 3 | 4
  title: string // short: "Reconsider Travel"
  url: string
  updatedAt: string // ISO
}

// Aliases where State Dept name differs from app country name.
// Key = normalized State Dept name, value = ISO alpha-2 in the app.
const ALIASES: Record<string, string> = {
  'burma': 'MM',
  'czech republic': 'CZ',
  'russia': 'RU',
  'south korea': 'KR',
  'korea south': 'KR',
  'republic of korea': 'KR',
  'united kingdom': 'GB',
  'the bahamas': 'BS',
  'the gambia': 'GM',
  'cape verde': 'CV',
  'cote d ivoire': 'CI',
  "cote d'ivoire": 'CI',
  'timor leste': 'TL',
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Build normalized-name -> ISO2 map from app countries once per module load.
const NAME_TO_CODE: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const c of Object.values(countries)) {
    map[normalize(c.name)] = c.code
  }
  return map
})()

const SHORT_TITLES: Record<number, string> = {
  1: 'Exercise Normal Precautions',
  2: 'Exercise Increased Caution',
  3: 'Reconsider Travel',
  4: 'Do Not Travel',
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
let cache: { at: number; data: Record<string, Advisory> } | null = null

async function fetchAndParse(): Promise<Record<string, Advisory>> {
  const res = await fetch(
    'https://travel.state.gov/_res/rss/TAsTWs.xml',
    { headers: { 'User-Agent': 'from-nj-to-anywhere/1.0' } },
  )
  if (!res.ok) throw new Error(`Feed HTTP ${res.status}`)
  const xml = await res.text()
  const parser = new XMLParser({ ignoreAttributes: true })
  const doc = parser.parse(xml)
  const items: Array<{ title?: string; link?: string; pubDate?: string }> =
    doc?.rss?.channel?.item ?? []

  const out: Record<string, Advisory> = {}
  const titleRe = /^(.+?)\s*[-–]\s*Level\s*([1-4])/i

  for (const item of items) {
    const t = String(item.title ?? '')
    const m = titleRe.exec(t)
    if (!m) continue
    let rawName = m[1].trim()
    // Strip common suffixes from feed titles.
    rawName = rawName
      .replace(/\s*[-–]\s*see summaries\s*$/i, '')
      .replace(/\s+travel advisory\s*$/i, '')
      .trim()
    const level = Number(m[2]) as 1 | 2 | 3 | 4
    const norm = normalize(rawName)

    // Some feed entries cover multiple destinations (e.g. "Mainland China,
    // Hong Kong & Macau"). Expand to each ISO code the app knows about.
    const codes: string[] = []
    const direct = NAME_TO_CODE[norm] ?? ALIASES[norm]
    if (direct) {
      codes.push(direct)
    } else {
      if (/\bmainland china\b/.test(norm)) codes.push('CN')
      if (/\bhong kong\b/.test(norm)) codes.push('HK')
      if (/\bmacau\b/.test(norm)) codes.push('MO')
    }
    if (codes.length === 0) continue

    const link = String(item.link ?? '')
    const pub = String(item.pubDate ?? '')
    const parsedDate = pub ? new Date(pub) : null
    const updatedAt =
      parsedDate && !isNaN(parsedDate.getTime())
        ? parsedDate.toISOString()
        : ''
    for (const code of codes) {
      out[code] = {
        level,
        title: SHORT_TITLES[level],
        url: link,
        updatedAt,
      }
    }
  }

  return out
}

export const getTravelAdvisories = createServerFn({ method: 'GET' }).handler(
  async () => {
    const now = Date.now()
    if (cache && now - cache.at < CACHE_TTL_MS) return cache.data
    try {
      const data = await fetchAndParse()
      cache = { at: now, data }
      return data
    } catch (err) {
      // On failure, return last-known-good if available, else empty.
      if (cache) return cache.data
      console.error('[advisories] fetch failed:', err)
      return {} as Record<string, Advisory>
    }
  },
)
