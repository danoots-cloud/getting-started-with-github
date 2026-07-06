## Goal

Give each popular place its own detail view with the same climate chart the country panel uses, plus a small zoomed map of the country with the place plotted. Pilot on Brazil so the pattern is proven before rolling out to all 699 places.

## UX shape

**Country panel — Popular Places list (unchanged layout, richer content):**

```
┌─ Popular Places ────────────────────────────┐
│  Rio de Janeiro                          ›  │
│  Beach city, Christ the Redeemer...         │
│  ● Avg high 82°F · Wettest Dec–Mar          │
├─────────────────────────────────────────────┤
│  São Paulo                               ›  │
│  ...                                        │
└─────────────────────────────────────────────┘
```

Each row becomes a button. The one-line "climate glance" is derived from the place's monthly data (annual mean high + wettest quarter). A right-chevron signals drill-in.

**Place detail — nested sub-panel:**

Clicking a place slides a new panel over the country panel (same width, same slide-in animation). The country panel stays mounted underneath so state is preserved.

```
┌─ ← Brazil                              × ─┐
│  Rio de Janeiro                            │
│  Coastal · Brazil                          │
│                                            │
│  ┌───────────── Country map ──────────┐   │
│  │       [Brazil outline, ● Rio]       │   │
│  └────────────────────────────────────┘   │
│                                            │
│  Climate by Month                          │
│  [same TemperatureChart component]         │
│                                            │
│  About                                     │
│  [existing place.description, room to grow]│
└────────────────────────────────────────────┘
```

- Back arrow returns to the country panel (scroll position preserved).
- The panel-level close (×) closes the whole thing back to the map, matching current behavior.
- ESC key: closes the sub-panel first, then the country panel on a second press.
- No URL change (matches current app; a route-based version can come later without reworking the UI).

## Map: reuse WorldMap, zoomed to country

`src/components/WorldMap.tsx` already renders country SVG paths. Add a "focused" mode that:

1. Takes a country code + a `{lat, lng}` marker.
2. Computes the bounding box of that country's path(s) and sets the SVG `viewBox` to that box with a small padding — this is the "zoom".
3. Renders the country's own path highlighted, neighbors greyed at low opacity for context.
4. Plots the marker as a small dot with the site's coral accent (`#E86A5C`) and a subtle drop shadow, positioned by projecting `{lat, lng}` with the same projection WorldMap already uses.
5. Non-interactive (no pan/zoom); pure SVG, no new dependencies.

If the existing WorldMap doesn't expose its projection cleanly, extract it into a small helper (`src/lib/map-projection.ts`) so both the full map and the zoomed map share it — otherwise the marker will drift from the country outline.

## Data

Two changes, both additive:

1. **`CountryData.popularPlaces` entries gain climate + coords.** New optional shape:

   ```ts
   popularPlaces: {
     name: string
     description: string
     // New — optional so unmigrated places don't break
     coords?: { lat: number; lng: number }
     temperatures?: { month: string; high: number; low: number }[]
     precipitation?: number[]
   }[]
   ```

2. **New CSV importer script** (`scripts/import-places-climate.ts`, dev-time only, not shipped):
   - Reads the uploaded CSV.
   - Matches rows to existing `popularPlaces` entries by `(country, place name)`.
   - Emits a TypeScript object keyed the same way, which we merge into `countries.ts`.
   - For the pilot: only apply Brazil's rows. Everything else in the CSV is ignored on this pass.

The script's output for Brazil gets merged into `src/data/countries.ts` by hand this turn. Places without matching CSV rows (spelling drift, extras) get logged so we can reconcile later.

## Files touched

1. `src/data/countries.ts` — extend `PopularPlace` type; populate coords/temperatures/precipitation for Brazil's places.
2. `src/components/CountryPanel.tsx` — Popular Places rows become buttons; add climate-glance line; wire sub-panel open state.
3. `src/components/PlacePanel.tsx` — **new**, the sub-panel (header with back arrow, map, chart, description).
4. `src/components/PlaceMap.tsx` — **new**, WorldMap in "focused" mode with a marker.
5. `src/components/WorldMap.tsx` — small refactor to expose the projection + country bounding-box helpers (only if needed to keep the marker aligned).
6. `src/lib/place-climate.ts` — **new**, tiny helper that turns 12-month arrays into the one-line "climate glance" string.
7. `scripts/import-places-climate.ts` — **new**, dev-only CSV → TS merger.

No new npm packages, no server functions, no routing changes.

## Things to consider for the future (not built now)

- **Own URLs per place** — the sub-panel is a stepping stone. When places gain photos and longer copy, promoting them to `/country/$c/place/$p` unlocks sharing and SEO. The sub-panel's data flow (place object + country context) maps 1:1 to a route loader, so the migration is mostly moving JSX, not rewriting logic.
- **Photos** — reserve a `photos?: string[]` field on `PopularPlace` now (unused) so the shape is stable when images arrive.
- **Search / linking places** — once places have detail, users will want to link straight to one from search results. Route-based version handles this for free.
- **Data volume** — 699 places × 24 numbers = ~17k values. Fine inline in `countries.ts` for now; if bundle size becomes a concern, split places into `src/data/places.ts` and lazy-load per country.
- **Distance / travel time from the country capital** — natural next field for the place panel once the layout settles.

## Out of scope this turn

- Photos, reviews, external data enrichment.
- Rolling data out beyond Brazil.
- Interactive maps (pan/zoom, clickable markers).
- Route-based URLs.
