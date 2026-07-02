# Replace climate data from uploaded CSV

## What you'll get
Every country in the app gets its `temperatures` (12 months of high/low °F) and `precipitation` (12 months, mm) arrays overwritten with values from `country_monthly_climate.csv` (World Bank CCKP / CRU TS 4.10, 1991–2020 normals). Units already match the app (°F + mm), so no conversion.

## Coverage check
- App has 102 countries, all keyed by ISO alpha-2 (e.g. `AT`, `US`, `IN`).
- CSV has 246 countries with both alpha-2 and alpha-3 codes, 12 rows each.
- Matching on alpha-2 → expected 100% match. Any misses (e.g. Kosovo, edge codes) get reported and left untouched.

## Steps
1. Write a Node script (`/tmp/apply_climate.mjs`) that:
   - Parses the CSV, groups rows by alpha-2 country code, sorts by month 1–12.
   - Reads `src/data/countries.ts` as text.
   - For each app country block, locates its `temperatures: [ … ]` and `precipitation: [ … ]` arrays via regex bounded to that country's object, and rewrites them with the CSV values.
   - Rounds temps to whole °F, precipitation to whole mm (keeps the existing display style).
   - Preserves existing month strings ("Jan"…"Dec") and every other field (culture, tips, colors, etc.).
2. Run the script, print a report: countries updated / unmatched / any parse failures.
3. Spot-check 3 countries (US, IN, AU) in the diff to confirm values look right and the file still parses.
4. Verify by running the project's typecheck implicitly via the build pipeline.

## Not doing
- Not changing the data shape, chart component, or any UI.
- Not touching countries missing from the CSV (will list them for you if any).
- Not storing the raw CSV in the repo — values are inlined into `countries.ts` as before.

Approve and I'll run it.
