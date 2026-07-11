// Static place↔attraction relationships loaded from CSV.
// Data split into chunk files under src/data/placeAttractionRelationships/
// to keep individual source files manageable, following the same pattern
// used for destinationMonthlyScores and destinationMonthlyRecommendationReasons.

import chunk0 from "./placeAttractionRelationships/chunk0.json";
import chunk1 from "./placeAttractionRelationships/chunk1.json";
import chunk2 from "./placeAttractionRelationships/chunk2.json";

export interface PlaceAttractionRelationship {
  placeEntityId: string;
  countryCode: string;
  countryName: string;
  placeName: string;
  attractionEntityId: string;
  attractionName: string;
  relationshipType: string;
  distanceKm: number | null;
  distanceMiles: number | null;
  relationshipMethod: string;
  validationStatus: string;
  validationReason: string;
  relationshipConfidence: string;
  researchStatus: string;
  researchReason: string;
}

export const placeAttractionRelationships: PlaceAttractionRelationship[] = [
  ...(chunk0 as PlaceAttractionRelationship[]),
  ...(chunk1 as PlaceAttractionRelationship[]),
  ...(chunk2 as PlaceAttractionRelationship[]),
];

const byPlace = new Map<string, PlaceAttractionRelationship[]>();
const byAttraction = new Map<string, PlaceAttractionRelationship[]>();

for (const rel of placeAttractionRelationships) {
  let pl = byPlace.get(rel.placeEntityId);
  if (!pl) {
    pl = [];
    byPlace.set(rel.placeEntityId, pl);
  }
  pl.push(rel);

  let al = byAttraction.get(rel.attractionEntityId);
  if (!al) {
    al = [];
    byAttraction.set(rel.attractionEntityId, al);
  }
  al.push(rel);
}

export function getAttractionsForPlace(
  placeEntityId: string,
): PlaceAttractionRelationship[] {
  return byPlace.get(placeEntityId) ?? [];
}

export function getPlacesForAttraction(
  attractionEntityId: string,
): PlaceAttractionRelationship[] {
  return byAttraction.get(attractionEntityId) ?? [];
}
