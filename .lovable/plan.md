# US State Dept travel advisories in country panel

## What you'll get
Each country panel shows a small colored badge like **"⚠ Level 2 – Exercise Increased Caution"** that links to the full advisory on travel.state.gov. Data comes live from the US State Department, cached server-side, so it stays current with no manual maintenance. If a country has no listing, the badge is hidden.

## How it works

**Source**: `https://travel.state.gov/_res/rss/TAsTWs.xml` — official RSS feed of every current advisory (updated by State Dept as changes happen). Each item includes country name, advisory level (1–4), title, publish date, and link.

**Fetch path**: TanStack server function `getTravelAdvisories` — fetches the XML, parses to `{ [iso2]: { level, title, url, updatedAt } }`, caches in-worker for 6 hours. All 100+ countries returned in one payload (~5 KB), so we hydrate once per session rather than per country click.

**Country matching**: State Dept lists by country name. I'll map to your alpha-2 codes with a small lookup table (e.g. "Korea, South" → `KR`, "United Kingdom" → `GB`). Unmatched entries are ignored; the panel just hides the badge.

**Display** (in `CountryPanel.tsx`, above the "Best Time to Visit" section):
- Level 1 (green) — Exercise Normal Precautions
- Level 2 (amber) — Exercise Increased Caution
- Level 3 (orange) — Reconsider Travel
- Level 4 (red) — Do Not Travel
- Compact pill: colored dot + `Level N — <short title>` + tiny "↗ travel.state.gov" link
- Hidden entirely if no advisory exists for that country

## Steps

1. **Add XML parser**: `bun add fast-xml-parser` (tiny, worker-safe).
2. **Create `src/lib/advisories.functions.ts`** with `getTravelAdvisories` server function (fetch + parse + 6h in-memory cache).
3. **Create `src/lib/advisory-country-map.ts`** — name→ISO2 lookup for the ~100 countries in your app.
4. **Wire TanStack Query** in `src/routes/index.tsx`: prefetch advisories once via `queryClient.ensureQueryData`, so all subsequent panel opens are instant.
5. **Add `<AdvisoryBadge>` component** and render it near the top of `CountryPanel.tsx`; it reads from the query cache and renders nothing when the country has no entry.
6. **Verify**: open the preview, click a country known to have an advisory (e.g. Mexico, Egypt) and one that doesn't, screenshot both to confirm the badge behavior.

## Freshness
- Server cache: 6 hours per Worker instance — new deploys and cold starts refresh immediately.
- State Dept updates the feed as advisories change; you'll typically see updates within a day.
- Zero maintenance from you.

## Files touched
- `src/lib/advisories.functions.ts` (new)
- `src/lib/advisory-country-map.ts` (new)
- `src/components/AdvisoryBadge.tsx` (new)
- `src/components/CountryPanel.tsx` (add badge)
- `src/routes/index.tsx` (prefetch in loader)
- `package.json` (fast-xml-parser)

## Not doing
- No database, no cron, no Lovable Cloud.
- Not adding advisories for non-US-listed countries.
- Not surfacing the full advisory text — just level + title + link out.

Approve and I'll build it.
