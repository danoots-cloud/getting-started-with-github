# Plan: 12-month climate chart with temperature + precipitation

## Goal
Show every country's full annual climate in one chart: temperature (solid line, left axis) and precipitation (dotted line, right axis). Precipitation values will be directionally accurate — correct seasonal shape and rough magnitude per climate zone — not measurement-grade.

## Step 1 — Expand temperature data to 12 months
- Update the `Country` type in `src/data/countries.ts` so `temperatures` is a 12-element array (Jan–Dec) instead of 4 seasonal points.
- For each country, fill the 8 missing months by interpolating between the existing Jan / Apr / Jul / Oct anchors using cosine interpolation, then round to whole degrees. Preserves each country's existing seasonal shape.
- One-time local script; no API calls.

## Step 2 — Add precipitation data (12 months per country)
- Add `precipitation: number[]` (mm per month, 12 values) to each country.
- Authoring approach — assign each country a climate archetype and apply that archetype's monthly pattern, then nudge based on country specifics:
  - **Mediterranean** (Spain, Italy, Greece): wet Nov–Mar, dry Jun–Aug
  - **Monsoon** (India, Thailand, Vietnam): dry winter, heavy Jun–Sep
  - **Equatorial** (Indonesia, Colombia, DRC): wet year-round, 150–250mm/mo
  - **Desert / arid** (Egypt, Saudi Arabia, Libya): near zero year-round
  - **Temperate maritime** (UK, Ireland, NZ): steady 60–100mm year-round, slight autumn peak
  - **Continental** (Russia, Canada, Kazakhstan): summer peak, dry cold winter
  - **Tropical wet/dry savanna** (Kenya, Brazil interior): bimodal or single wet season
  - **Subarctic / polar** (Iceland, Greenland, northern Russia): low totals, modest variation
- Result: shape and rough magnitude per month are correct (a user looking at India will clearly see the monsoon; Egypt will be flat near zero; UK will be steady).

## Step 3 — Dual-axis chart
Update `src/components/TemperatureChart.tsx`:
- 12 month labels on the x-axis (J F M A M J J A S O N D) to stay readable in the side panel.
- Add a precipitation dataset:
  - Dotted line (`borderDash: [4, 4]`)
  - Bound to right-side y-axis (`yAxisID: 'y1'`), unit "mm"
  - Distinct color (cool blue) vs temperature (existing warm color)
- Chart.js `scales`:
  - `y` (left): °C
  - `y1` (right): mm, `grid.drawOnChartArea: false` to avoid double gridlines
- Legend labels: "Temperature (°C)", "Precipitation (mm)".
- Tooltip shows both values for the hovered month.

## Step 4 — Verify
- `bun run build:dev` to confirm types compile.
- Playwright: open a few climate-distinct countries (India, Egypt, UK, Indonesia, Russia), screenshot the panel, confirm the dotted precipitation line matches the expected pattern and both axes render cleanly.

## Credit cost
Negligible — no AI model calls, no per-country multiplier. Static data edits + one component update.

## Files touched
- `src/data/countries.ts` — extend type, fill 12-month temps, add precipitation arrays
- `src/components/TemperatureChart.tsx` — dual-axis, dotted precipitation series, 12 labels
