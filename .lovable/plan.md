## What's happening

The data is fine — every Canadian place has its correct coordinates in `src/data/places-climate.ts` (Banff `51.6, -116.05`, Vancouver `49.2, -123.1`, Toronto `43.7, -79.4`, Quebec City `46.8, -71.2`). The bug is in **`PlaceMap`**: it fits the map to the **whole country's bounding box**.

Canada spans roughly 5,500 km east-to-west and 4,600 km north-to-south. In a ~500×310 px panel, the whole country is drawn at the same scale for every Canadian place. The 14 px marker dot **is** rendered at the correct lat/lng, but it lands somewhere inside a country that fills the frame — visually every map looks identical, and the pin is easy to miss because it's tiny relative to the country outline.

Same class of bug applies to Russia, USA, China, Brazil, Australia, Argentina, India, Kazakhstan, DRC, Algeria, Greenland — anywhere the country is much larger than a single point of interest can meaningfully sit in.

Symptomatic small countries (Bahrain, Luxembourg, Singapore) look fine today for the same reason: their bounds are small enough that fitting the country IS a place-level view.

## Fix

Change `PlaceMap`'s framing rule from "always fit to country bounds" to a hybrid:

```text
country_span_deg = max(bounds.width, bounds.height)  // in degrees

if country_span_deg <= SMALL_COUNTRY_THRESHOLD (≈ 12°):
    fit to country bounds          // small country → full outline + pin
else:
    fit to a place-centered window ≈ ±3.5° around the pin,
    with the country outline still rendered as context
```

Threshold values are tunable, but ~12° covers the UK, Italy, Japan, Germany, Vietnam, most of Europe as "small country" (full outline shown) and drops the US/Canada/Russia/etc. to the regional view. ±3.5° gives a window roughly 500–800 km wide — big enough to show a chunk of the country outline around the place, small enough that the marker reads clearly.

The country outline stays highlighted in the accent color regardless — for a place in Canada you'll see the marker centered, a slice of Canada shaded around it, and neighboring US/Alaska greyed where they intrude into the viewport. That gives geographic context without hiding the pin.

Also, make the marker itself slightly more legible on busy backgrounds: bump it to 16 px with a white ring and a soft drop shadow (already partly done — just increase contrast).

## Files touched

1. `src/components/PlaceMap.tsx` — replace the `fitBounds(countryBounds)` call with the hybrid framing logic; bump marker size/contrast.

That's it. No changes to data, `CountryPanel`, `PlacePanel`, or the CSV import. The lookup is correct; only the map framing is wrong.

## Out of scope

- Interactive pan/zoom on the place map.
- Multiple markers per view (e.g. all popular places in a country).
- Switching map providers.
