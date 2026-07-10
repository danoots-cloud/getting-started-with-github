// Static monthly recommendation reason explanations loaded from CSV.
// Kept separate from destinationMonthlyScores — this is the explanation layer.

import chunk0 from "./destinationMonthlyRecommendationReasons/chunk0.json";
import chunk1 from "./destinationMonthlyRecommendationReasons/chunk1.json";
import chunk2 from "./destinationMonthlyRecommendationReasons/chunk2.json";

export type ReasonEntityType = "country" | "place" | "attraction";

export interface DestinationMonthlyRecommendationReason {
  entityId: string;
  entityType: ReasonEntityType;
  countryCode: string;
  countryName: string;
  name: string;
  month: number;
  recommendationReasonLabel: string;
  recommendationReason: string;
  reasonType: string;
  reasonConfidence: string;
  avgHighF: number;
  avgLowF: number;
  precipMm: number;
  weatherComfortScore: number;
  crowdScore: number;
  crowdConfidence: string;
  experienceSeasonScore: number;
  experienceSeasonConfidence: string;
  seasonalityType: string;
  seasonalTravelerIntentAdjustment: number;
  seasonalTravelerIntentReason: string;
  recommendationScore: number;
}

export const destinationMonthlyRecommendationReasons: DestinationMonthlyRecommendationReason[] = [
  ...(chunk0 as DestinationMonthlyRecommendationReason[]),
  ...(chunk1 as DestinationMonthlyRecommendationReason[]),
  ...(chunk2 as DestinationMonthlyRecommendationReason[]),
];

const byEntityMonth = new Map<string, DestinationMonthlyRecommendationReason>();
for (const row of destinationMonthlyRecommendationReasons) {
  byEntityMonth.set(`${row.entityId}::${row.month}`, row);
}

export function getMonthlyRecommendationReason(
  entityId: string,
  month: number,
): DestinationMonthlyRecommendationReason | undefined {
  return byEntityMonth.get(`${entityId}::${month}`);
}
