import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MLMap } from 'maplibre-gl'
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'

// Same Natural Earth source as WorldMap — served from jsdelivr CDN, cached.
const GEO_URL =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson'

const COLOR_OCEAN = '#EAD9BE'
const COLOR_LAND_NEIGHBOR = '#D9C4A3'
const COLOR_BORDER = '#1E2A44'

interface PlaceMapProps {
  countryCode: string
  coords: { lat: number; lng: number }
  accentColor: string
}

type CountryGeoJSON = FeatureCollection<Geometry, { code: string | null }>

let cachedGeo: CountryGeoJSON | null = null

async function loadGeo(): Promise<CountryGeoJSON> {
  if (cachedGeo) return cachedGeo
  const res = await fetch(GEO_URL)
  const raw = (await res.json()) as FeatureCollection<Geometry, Record<string, unknown>>
  const features = raw.features.map((f) => {
    const props = f.properties ?? {}
    const pick = (k: string) => {
      const v = props[k]
      return typeof v === 'string' && v && v !== '-99' ? v : undefined
    }
    const alpha2Raw = pick('ISO_A2') ?? pick('ISO_A2_EH') ?? pick('WB_A2') ?? pick('FIPS_10')
    const code = alpha2Raw ? alpha2Raw.toUpperCase() : null
    return { type: 'Feature' as const, geometry: f.geometry, properties: { code } }
  })
  cachedGeo = { type: 'FeatureCollection', features }
  return cachedGeo
}

function featureBounds(feat: Feature<Geometry>): maplibregl.LngLatBounds | null {
  const bounds = new maplibregl.LngLatBounds()
  const g = feat.geometry
  const eachPos = (pos: Position) => bounds.extend([pos[0], pos[1]])
  const eachRing = (ring: Position[]) => ring.forEach(eachPos)
  const eachPoly = (poly: Position[][]) => poly.forEach(eachRing)

  if (g.type === 'Polygon') eachPoly(g.coordinates)
  else if (g.type === 'MultiPolygon') g.coordinates.forEach(eachPoly)
  else return null
  return bounds
}

export function PlaceMap({ countryCode, coords, accentColor }: PlaceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let map: MLMap | null = null

    const map_ = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: 'ocean', type: 'background', paint: { 'background-color': COLOR_OCEAN } }],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [coords.lng, coords.lat],
      zoom: 3,
      minZoom: 1,
      maxZoom: 8,
      renderWorldCopies: false,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      interactive: false,
    })
    map = map_

    map_.on('load', async () => {
      const geo = await loadGeo()
      if (cancelled || !map) return

      const target = geo.features.find((f) => f.properties.code === countryCode)

      map.addSource('countries', { type: 'geojson', data: geo })

      // Neighbors: everything except the target country, muted.
      map.addLayer({
        id: 'neighbors-fill',
        type: 'fill',
        source: 'countries',
        paint: { 'fill-color': COLOR_LAND_NEIGHBOR, 'fill-opacity': 0.6 },
        filter: ['!=', ['get', 'code'], countryCode],
      })
      map.addLayer({
        id: 'neighbors-line',
        type: 'line',
        source: 'countries',
        paint: { 'line-color': COLOR_BORDER, 'line-width': 0.4, 'line-opacity': 0.25 },
        filter: ['!=', ['get', 'code'], countryCode],
      })

      // Target country highlighted.
      map.addLayer({
        id: 'country-fill',
        type: 'fill',
        source: 'countries',
        paint: { 'fill-color': accentColor, 'fill-opacity': 0.65 },
        filter: ['==', ['get', 'code'], countryCode],
      })
      map.addLayer({
        id: 'country-line',
        type: 'line',
        source: 'countries',
        paint: { 'line-color': COLOR_BORDER, 'line-width': 1.4, 'line-opacity': 0.7 },
        filter: ['==', ['get', 'code'], countryCode],
      })

      // Always frame the whole country so the pin's position within it is obvious.
      const countryBounds = target ? featureBounds(target) : null
      if (countryBounds) {
        map.fitBounds(countryBounds, { padding: 24, animate: false, duration: 0 })
      } else {
        map.fitBounds(
          [
            [coords.lng - 3.5, coords.lat - 3.5],
            [coords.lng + 3.5, coords.lat + 3.5],
          ],
          { padding: 16, animate: false, duration: 0 }
        )
      }

      // Marker dot for the place — larger with a white ring so it reads on any background.
      const el = document.createElement('div')
      el.style.cssText = `
        width: 16px; height: 16px; border-radius: 999px;
        background: ${accentColor}; border: 3px solid #FBF5EC;
        box-shadow: 0 2px 8px rgba(30,42,68,0.5), 0 0 0 1px rgba(30,42,68,0.35);
      `
      new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map)

    })

    return () => {
      cancelled = true
      map_.remove()
    }
  }, [countryCode, coords.lat, coords.lng, accentColor])

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[#1E2A44]/10" style={{ aspectRatio: '16 / 10' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, background: COLOR_OCEAN }} />
    </div>
  )
}
