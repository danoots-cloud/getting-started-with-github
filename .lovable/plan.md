## Fix: selected country color not updating on the world map

### Diagnose
Add a temporary `console.log` in the WorldMap selection `useEffect` recording `nextId`, whether the source is loaded (`map.isSourceLoaded('countries')`), and the feature state before/after. Click a country in the running preview via Playwright, capture the console output plus a screenshot, and confirm which of these is happening:

1. Effect never runs (prop not updated).
2. Effect runs but `setFeatureState` no-ops (source not loaded / wrong feature id).
3. Feature state is set correctly but the fill layer isn't repainting (paint-expression / ordering issue).

### Likely fixes (apply whichever the diagnosis points to)

- **If the feature id doesn't match**: geometries whose ISO code parses as `null` fall back to `id: x${idx}`. Countries with unusual ISO fields (e.g. Norway, France in some Natural Earth builds) resolve to a non-uppercase or missing code, so `selectedCode` (uppercase alpha-2) won't match the feature id. Fix by always uppercasing on both sides and, when `alpha2` is present, using it verbatim as the feature id (already done) — but also ensure the click handler passes the same casing back (`props.code`). Add a guard that logs a warning if `map.getFeatureState({source,id:nextId})` returns empty after `setFeatureState`.

- **If the source isn't loaded yet at click time** (unlikely but possible on slow loads): wrap the `setFeatureState` calls in an `isSourceLoaded('countries')` check, and if false, queue them on the next `sourcedata` event for that source.

- **If the paint expression isn't repainting**: MapLibre sometimes needs the fill-color expression to actually change to trigger a repaint. Since `buildFillExpression` doesn't reference `flagColors`, calling `setPaintProperty` with an identical expression can be a no-op. Fix by either (a) removing the redundant `setPaintProperty` call from the selection effect (feature-state changes alone should repaint), or (b) calling `map.triggerRepaint()` after `setFeatureState`.

- **If hover state is masking selected**: the `case` order already puts `selected` before `hover`, but confirm by explicitly clearing the hover feature-state on the newly selected id right after setting `selected: true`.

### Verify
- Click a country in the preview; confirm the fill turns dark navy (`#0F172A`).
- Close the panel; confirm the country returns to its previous orange/sand fill.
- Open a different country; confirm the previous one resets and the new one turns navy.
- Repeat with recommendation mode active — the selected country should still turn navy over the recommendation orange.
- Remove the diagnostic `console.log` before finishing.
- Run typecheck.

### Files expected to change
- `src/components/WorldMap.tsx` (only)
