// Explicit seasonal-availability overrides for Popular Places used in lead-place selection.
// Only entries listed here have overrides; all other places are unrestricted.

export type LeadRecommendationRule = 'exclude_outside_available_months'

export interface PopularPlaceSeasonalAvailability {
  entityId: string
  countryCode: string
  countryName: string
  placeName: string
  availabilityType: string
  availableMonths: number[]
  excludedMonths: number[]
  leadRecommendationRule: LeadRecommendationRule
  confidence: string
  sourceUrl: string
  evidenceSummary: string
}

export const popularPlaceSeasonalAvailability: PopularPlaceSeasonalAvailability[] = [
  {
    entityId: 'place_NL_8469097',
    countryCode: 'NL',
    countryName: 'Netherlands',
    placeName: 'Keukenhof',
    availabilityType: 'seasonal_closure',
    availableMonths: [3, 4, 5],
    excludedMonths: [1, 2, 6, 7, 8, 9, 10, 11, 12],
    leadRecommendationRule: 'exclude_outside_available_months',
    confidence: 'high',
    sourceUrl:
      'https://keukenhof.nl/en/zakelijke-veelgestelde-vragen/when-will-keukenhof-be-open/',
    evidenceSummary:
      'Official Keukenhof information states the park is open only during its spring season; in 2026 it was open March 19 through May 10. At month-level granularity, allow March-May and exclude all other months from lead-place selection.',
  },
]

const byEntityId = new Map<string, PopularPlaceSeasonalAvailability>()
for (const r of popularPlaceSeasonalAvailability) byEntityId.set(r.entityId, r)

export function getSeasonalAvailability(
  entityId: string,
): PopularPlaceSeasonalAvailability | undefined {
  return byEntityId.get(entityId)
}

/** Returns true if this entityId is eligible to be the lead place for `month` (1-12). */
export function isPlaceEligibleAsLead(entityId: string, month: number): boolean {
  const rule = byEntityId.get(entityId)
  if (!rule) return true
  if (rule.leadRecommendationRule === 'exclude_outside_available_months') {
    return rule.availableMonths.includes(month)
  }
  return true
}
