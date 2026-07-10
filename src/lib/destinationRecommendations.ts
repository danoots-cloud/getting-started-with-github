// Recommendation logic for the "Where should I go?" feature.
// Pure module — no network calls, no React. Consumes existing data.

import { countries, type CountryData, type PopularPlace } from '@/data/countries'
import {
  getScoresForMonth,
  type DestinationMonthlyScore,
} from '@/data/destinationMonthlyScores'
import { placeEntityIds } from '@/data/placeEntityIds'
import { isPlaceEligibleAsLead } from '@/data/popularPlaceSeasonalAvailability'
import type { Advisory } from '@/lib/advisories.functions'

export const MAX_RECOMMENDATIONS = 24
const EXCLUDED_PUBLIC_LABEL = 'Worth considering'

export type AdvisoryPreference = 'levels-1-2' | 'include-level-3'

export interface RecommendationFilters {
  month: number // 1-12
  maxFlightHours: number | null // null = any
  advisoryPreference: AdvisoryPreference
}

export interface DestinationRecommendation {
  countryCode: string
  country: CountryData
  leadPlace: PopularPlace | null // null when country fallback used
  score: DestinationMonthlyScore
  advisoryLevel: 1 | 2 | 3 // level used for eligibility (never 4)
  publicLabel: string // "Excellent fit" etc — derived from visitTier
}

const NAME_NORM = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

// Extract the leading numeric hours from strings like:
//  "~8.5 hours direct", "~10 hours (no direct, 1+ stop)".
// Returns null if unparseable.
export function parseFlightHours(text: string | undefined): number | null {
  if (!text) return null
  const m = /(\d+(?:\.\d+)?)\s*hours?/i.exec(text)
  return m ? Number(m[1]) : null
}

const TIER_LABELS: Record<string, string> = {
  excellent: 'Excellent fit',
  very_good: 'Great fit',
  good: 'Good fit',
  mixed: 'Worth considering',
  poor: 'Worth considering',
}

export function visitTierLabel(tier: string): string {
  const key = tier.toLowerCase().replace(/[\s-]+/g, '_')
  return TIER_LABELS[key] ?? 'Worth considering'
}

function scoreForPlace(
  countryCode: string,
  placeName: string,
  monthIndex: Map<string, DestinationMonthlyScore>,
): DestinationMonthlyScore | null {
  const byCountry = placeEntityIds[countryCode]
  if (!byCountry) return null
  const entityId = byCountry[NAME_NORM(placeName)]
  if (!entityId) return null
  return monthIndex.get(entityId) ?? null
}

export function getDestinationRecommendations(
  filters: RecommendationFilters,
  advisories: Record<string, Advisory> | undefined,
): DestinationRecommendation[] {
  if (!advisories) return []

  // Index this month's scores by entityId for O(1) lookup.
  const monthScores = getScoresForMonth(filters.month)
  const monthIndex = new Map<string, DestinationMonthlyScore>()
  for (const s of monthScores) monthIndex.set(s.entityId, s)

  const results: DestinationRecommendation[] = []

  for (const country of Object.values(countries)) {
    // Advisory eligibility — MUST have advisory data; never default to Level 1.
    const adv = advisories[country.code]
    if (!adv) continue
    if (adv.level === 4) continue
    if (filters.advisoryPreference === 'levels-1-2' && adv.level > 2) continue

    // Flight-time eligibility (skip filter when null = "Any").
    if (filters.maxFlightHours != null) {
      const hours = parseFlightHours(country.flightTimeFromEWR)
      if (hours == null) continue // unparseable = exclude to be safe
      if (hours > filters.maxFlightHours) continue
    }

    // Score popular places → pick the highest recommendationScore.
    // Apply explicit seasonal-availability overrides (by entityId) before comparing.
    let leadPlace: PopularPlace | null = null
    let leadScore: DestinationMonthlyScore | null = null
    const byCountryIds = placeEntityIds[country.code]
    for (const place of country.popularPlaces) {
      const entityId = byCountryIds?.[NAME_NORM(place.name)]
      if (!entityId) continue
      if (!isPlaceEligibleAsLead(entityId, filters.month)) continue
      const s = monthIndex.get(entityId)
      if (!s || s.recommendationScore == null) continue
      if (!leadScore || (s.recommendationScore ?? -Infinity) > (leadScore.recommendationScore ?? -Infinity)) {
        leadScore = s
        leadPlace = place
      }
    }

    // Fallback to the country-level score row when no place matched.
    if (!leadScore) {
      const fallback = monthIndex.get(`country_${country.code}`)
      if (!fallback || fallback.recommendationScore == null) continue
      leadScore = fallback
      leadPlace = null
    }

    const publicLabel = visitTierLabel(leadScore.visitTier)
    // Curate: hide "Worth considering" tier from recommendation results.
    if (publicLabel === EXCLUDED_PUBLIC_LABEL) continue

    results.push({
      countryCode: country.code,
      country,
      leadPlace,
      score: leadScore,
      advisoryLevel: adv.level as 1 | 2 | 3,
      publicLabel,
    })
  }

  results.sort(
    (a, b) => (b.score.recommendationScore ?? -Infinity) - (a.score.recommendationScore ?? -Infinity),
  )
  // Cap the actual result set — map and list must share this exact set.
  return results.slice(0, MAX_RECOMMENDATIONS)
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const
