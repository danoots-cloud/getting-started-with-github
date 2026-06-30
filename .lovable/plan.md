# Migrate `dans-travel-inspiration` into this Lovable project

## Goal
Bring the travel inspiration app (world map, country panels, temperature charts) from the external GitHub repo into the current Lovable project so it runs in the Lovable preview and syncs bidirectionally with GitHub.

## What the external repo contains
- **Stack**: TanStack Start, React 19, Tailwind CSS v4, Vite
- **UI**: World map (`react-simple-maps`), temperature chart (`chart.js` + `react-chartjs-2`), country detail panel, flag component
- **Data**: Large `countries.ts` file (~300KB) with country metadata and climate data
- **Styling**: Custom Tailwind theme (`@theme` with accent/success/warning/danger colors, DM Sans + Fraunces fonts, custom scrollbar, slide-in animation)
- **Routes**: Single home route (`/`) in `src/routes/index.tsx`

## Current Lovable project state
- TanStack Start with shadcn/ui design system (semantic oklch colors, `tw-animate-css`, Radix primitives)
- Prettier, ESLint, `@lovable.dev/vite-tanstack-config`
- Ready for Lovable Cloud backend

---

## Step 1 — Install missing dependencies
Add the external repo's unique dependencies that do not exist in the current project:

```
bun add chart.js react-chartjs-2 react-simple-maps prop-types @tailwindcss/typography
bun add -D @types/react-simple-maps
```

(If `@types/react-simple-maps` does not exist, the repo already ships a hand-written `src/react-simple-maps.d.ts` declaration file — copy that in.)

## Step 2 — Copy source files
Copy these files from the external repo into the current project, preserving paths:

```
src/components/CountryPanel.tsx
src/components/Flag.tsx
src/components/TemperatureChart.tsx
src/components/WorldMap.tsx
src/data/countries.ts
src/react-simple-maps.d.ts
public/favicon.ico
public/tanstack-circle-logo.png
```

## Step 3 — Merge Tailwind styles (manual reconciliation required)
The external repo defines a custom `@theme` block and `body` font rule in `src/styles.css`. The current project has a full shadcn semantic color system (`--color-background`, `--color-primary`, etc.).

**Decision needed**: Choose one of the following approaches (I recommend **Option A** to keep the app visually distinct while preserving shadcn compatibility):

### Option A — Preserve shadcn system, add travel-app accents
Keep the current `:root`/`.dark` semantic variables and `@theme inline` block. Append the external repo's custom colors as additional theme variables (e.g., `--color-accent` is already present; add `--color-success`, `--color-warning`, `--color-danger` if not already mapped). Add the `slideIn` keyframe and `.animate-slideIn` utility. Load DM Sans and Fraunces fonts via `<link>` in `src/routes/__root.tsx` head.

### Option B — Replace with external repo's theme
Overwrite the `@theme` block with the external repo's simpler `@theme` definition. This abandons the shadcn color palette and may break any shadcn components already in use.

## Step 4 — Integrate the route
Replace the placeholder/boilerplate content in `src/routes/index.tsx` with the external repo's `src/routes/index.tsx` content. Wire it up so the home page renders the `WorldMap`, `CountryPanel`, etc.

## Step 5 — Verify and test
1. Run `bun run dev` and confirm the app compiles.
2. Open the preview and verify:
   - World map renders and is interactive
   - Clicking a country opens the country panel with flag and temperature chart
   - No console errors from `react-simple-maps` or `chart.js`
3. Make a small edit in Lovable and confirm it pushes to GitHub.
4. Make a small edit directly on GitHub and confirm it syncs back to Lovable.

## What NOT to overwrite
- `vite.config.ts` — Lovable's `@lovable.dev/vite-tanstack-config` handles TanStack Start, Tailwind, and path aliases. Do not restore the external repo's manual plugin list.
- `tsconfig.json` — Lovable's config has specific compiler settings for the sandbox; keep it unless there is a proven conflict.
- `src/router.tsx`, `src/server.ts`, `src/start.ts` — Lovable bootstrap files.
- `package.json` scripts — Lovable uses `build:dev`, `lint`, `format`; merge only the `dependencies` and `devDependencies` entries.

## Risks / open questions
- `react-simple-maps` v3 compatibility with React 19 — the external repo uses it, but it may need a type-declaration tweak.
- The external repo's `src/routes/__root.tsx` may define a different HTML shell (fonts, meta tags) than Lovable's. Merge carefully rather than overwrite.
- Font loading: the external repo relies on DM Sans and Fraunces. These should be loaded via `<link>` tags in the root route `head()`, not via CSS `@import` (Tailwind v4 strips remote `@import`).