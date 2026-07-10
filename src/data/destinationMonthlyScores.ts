// Static monthly recommendation scores loaded from CSV. Data split into
// chunk files under src/data/destinationMonthlyScores/ to respect per-file
// size limits; this module reassembles and indexes them.

import chunk0 from "./destinationMonthlyScores/chunk0.json";
import chunk1 from "./destinationMonthlyScores/chunk1.json";
import chunk2 from "./destinationMonthlyScores/chunk2.json";

export type DestinationEntityType = "country" | "place" | "attraction";

export interface DestinationMonthlyScore {
  entityId: string;
  entityType: DestinationEntityType;
  countryCode: string;
  month: number;
  monthName: string;
  avgHighF: number | null;
  avgLowF: number | null;
  precipMm: number | null;
  weatherComfortScore: number | null;
  weatherTier: string;
  crowdScore: number | null;
  crowdDesirabilityScore: number | null;
  crowdConfidence: string;
  crowdMethod: string;
  experienceSeasonScore: number | null;
  experienceSeasonConfidence: string;
  experienceSeasonMethod: string;
  seasonalityType: string;
  combinedVisitScore: number | null;
  visitTier: string;
  weatherWeight: number | null;
  crowdWeight: number | null;
  experienceWeight: number | null;
  climateSource: string;
  climateMatchStatus: string;
  seasonalTravelerIntentAdjustment: number;
  seasonalTravelerIntentReason: string;
  recommendationScore: number;
}

export const destinationMonthlyScores: DestinationMonthlyScore[] = [
  ...(chunk0 as DestinationMonthlyScore[]),
  ...(chunk1 as DestinationMonthlyScore[]),
  ...(chunk2 as DestinationMonthlyScore[]),
];

// Indexes so lookups don't scan the full 16k-row array.
const byEntityMonth = new Map<string, DestinationMonthlyScore>();
const byEntity = new Map<string, DestinationMonthlyScore[]>();
const byMonth = new Map<number, DestinationMonthlyScore[]>();

for (const row of destinationMonthlyScores) {
  byEntityMonth.set(`${row.entityId}::${row.month}`, row);
  let list = byEntity.get(row.entityId);
  if (!list) {
    list = [];
    byEntity.set(row.entityId, list);
  }
  list.push(row);
  let mlist = byMonth.get(row.month);
  if (!mlist) {
    mlist = [];
    byMonth.set(row.month, mlist);
  }
  mlist.push(row);
}

for (const list of byEntity.values()) {
  list.sort((a, b) => a.month - b.month);
}

export function getMonthlyScore(
  entityId: string,
  month: number,
): DestinationMonthlyScore | undefined {
  return byEntityMonth.get(`${entityId}::${month}`);
}

export function getEntityMonthlyScores(
  entityId: string,
): DestinationMonthlyScore[] {
  return byEntity.get(entityId) ?? [];
}

export function getScoresForMonth(month: number): DestinationMonthlyScore[] {
  return byMonth.get(month) ?? [];
}
