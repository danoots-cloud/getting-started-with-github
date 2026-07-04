
## Goal

Add a compact "Travel Requirements" section to each country's detail panel that tells a US passport holder at a glance whether there are hoops to jump through — not a how-to guide.

## Data shape

Add one optional field to each entry in `src/data/countries.ts`:

```ts
travelRequirements: {
  // Traffic-light summary — drives the badge color/icon in the UI
  difficulty: 'easy' | 'moderate' | 'advance-prep'
  // One-line human summary (max ~120 chars)
  summary: string
  // 0–3 short bullets naming the hoops, only when they exist
  notes?: string[]
}
```

Guidance for values (US passport holder from NJ):

- **easy** — visa-free / visa-on-arrival, no pre-registration.
  _e.g. Mexico:_ `"Visa-free up to 180 days. Passport only."`
- **moderate** — quick online pre-registration required (ETA, ESTA-equivalent, eVisa).
  _e.g. UK from 2025:_ `"ETA required — apply online before travel."`
  _e.g. Schengen from late 2026:_ `"ETIAS pre-authorization required."`
- **advance-prep** — embassy visa, invitation letter, in-person appointment, or notable extras (yellow fever proof, visa-on-arrival with paperwork).
  _e.g. India:_ `"eVisa required in advance."`
  _e.g. Russia:_ `"Embassy visa required; lengthy process."`

`notes` only appears when there's something worth flagging (passport 6-mo validity, blank pages, vaccination proof). Keep each note under ~60 chars.

## UI

New section in `src/components/CountryPanel.tsx`, styled to match existing sections:

```
┌─ Travel Requirements ───────────────────────┐
│  ● Easy         Visa-free up to 90 days.    │
│                 · Passport valid 6+ months  │
│  Verify at travel.state.gov ↗               │
└─────────────────────────────────────────────┘
```

- Colored dot/badge driven by `difficulty`:
  easy → green, moderate → amber, advance-prep → coral (site's `#E86A5C`).
- Link at the bottom to `https://travel.state.gov/content/travel/en/international-travel/International-Travel-Country-Information-Pages/<Country>.html` (built from country name) with a disclaimer: _"Rules change — verify with the State Department before booking."_
- Hidden entirely when the field is absent, so unmigrated countries aren't broken.

## Data population

For the initial pass I'll populate `travelRequirements` for every country currently in `countries.ts` (~100), using travel.state.gov's per-country "Entry, Exit and Visa Requirements" section as the source of truth. I'll batch this in one edit and keep phrasing consistent across entries.

## Files touched

1. `src/data/countries.ts` — extend `CountryData` type, add field to every existing entry.
2. `src/components/CountryPanel.tsx` — render the new section.
3. (No new dependencies, no server functions, no scraping.)

## Out of scope

- Live scraping / API integration.
- Country-of-origin selector (assumes US passport, from NJ).
- Vaccination detail beyond a one-line flag when it's a formal entry requirement.
- Visa application walkthroughs.
