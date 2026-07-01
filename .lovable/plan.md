# Replace header logo with hand-drawn "From NJ to Anywhere" lockup

## What you'll get
A single transparent-PNG horizontal logo that combines a hand-drawn illustration and the tagline as one designed lockup — no separate icon + text HTML. Drops straight into the header where the current Compass square + H1 live.

## Prompt strategy (this is where results live or die)
I'll generate with the **premium** image tier (best legibility for the tagline text) and a highly specific prompt. Key ingredients:

- **Medium**: "hand-drawn ink illustration with soft watercolor wash, subtle paper texture, slightly imperfect linework"
- **Composition**: horizontal lockup, ~3:1 aspect (1536×512), left-side illustration + right-side tagline, generous padding, nothing touching edges
- **Illustration**: a small map pin over New Jersey on a stylized globe fragment, with a **dotted arc** sweeping outward to a tiny paper plane — the arc visually leads the eye into the wordmark
- **Typography**: "From NJ to Anywhere" hand-lettered in a warm scripty style for "From ... to" and a bold sturdy serif for "NJ" and "Anywhere" (mimicking the app's Fraunces display font)
- **Palette (locked, spelled out in prompt)**: coral `#E86A5C`, amber `#F2A65A`, deep navy `#1E2A44`, cream accents `#FBF5EC`
- **Background**: solid white for clean cutout → `transparent_background: true` produces a transparent PNG
- **Negatives**: "no 3D, no gradients, no photorealism, no generic globe clipart, no stock plane silhouette, no rainbow colors, no drop shadows, no text errors"

I'll generate, inspect legibility of the tagline, and regenerate up to 2× if lettering is garbled (common failure with AI text).

## Steps

1. **Generate** logo with `imagegen--generate_image` (premium, 1536×512, transparent PNG) → `src/assets/logo-nj-to-anywhere.png`.
2. **Verify** by viewing the file; regenerate if the tagline text is misspelled or illegible.
3. **Edit `src/routes/index.tsx` header** (lines ~87–100):
   - Remove the gradient square with `<Compass>` icon and the `<h1>` text
   - Replace with `<img src={logo} alt="From NJ to Anywhere" className="h-10 sm:h-12 w-auto" />`
   - Keep the right-side "Click a country to explore" affordance untouched
4. **Keep the H1 for SEO** by moving the "Plan your next adventure from New Jersey" heading (already an h2) up to h1 semantics, since the visible brand h1 is now an image. Alt text preserves accessibility.
5. **Verify** via Playwright screenshot of the header at desktop width.

## Files touched
- `src/assets/logo-nj-to-anywhere.png` (new)
- `src/routes/index.tsx` (header block only; imports Compass removed if unused elsewhere)

## Credits
One premium image generation (plus up to 2 retries if text renders poorly). No other AI calls.

## Not doing
- Not touching the favicon (say the word and I'll derive an icon-only version from the same art)
- Not changing the rest of the header/layout
- Not restyling the page

Approve and I'll build it.