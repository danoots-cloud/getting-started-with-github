import { useEffect, useRef, useState, memo } from 'react'
import maplibregl, { type Map as MLMap, type MapGeoJSONFeature } from 'maplibre-gl'
import type { FeatureCollection, Geometry } from 'geojson'

import { countries } from '@/data/countries'
import 'maplibre-gl/dist/maplibre-gl.css'

// Natural Earth 110m (via nvkelso) — well-formed polygons with proper
// antimeridian splitting for Russia, Fiji, etc. ~840KB, cached by CDN.
const GEO_URL =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson'


// Palette — matches the warm sunset feel of the site.
const COLOR_OCEAN = '#EAD9BE' // slightly warmer than page bg so land pops
const COLOR_LAND_DATA = '#F2A65A' // countries with detailed data (warm sunset)
const COLOR_LAND_EMPTY = '#D9C4A3' // countries without data (muted sand)
const COLOR_LAND_HOVER = '#E86A5C' // hover accent
const COLOR_BORDER = '#1E2A44'

interface WorldMapProps {
  onCountryClick: (countryCode: string, countryName: string) => void
  selectedCountry: string | null
  flagColors: [string, string, string] | null
  /**
   * When provided, only these country codes are clickable/highlighted.
   * Non-listed countries render as muted geographic context.
   */
  eligibleCountries?: Set<string> | null
}

type CountryGeoJSON = FeatureCollection<Geometry, { name: string; code: string | null; hasData: boolean }>

let cachedGeo: CountryGeoJSON | null = null

async function loadCountriesGeoJSON(): Promise<CountryGeoJSON> {
  if (cachedGeo) return cachedGeo
  const res = await fetch(GEO_URL)
  const raw = (await res.json()) as FeatureCollection<Geometry, Record<string, unknown>>

  const features = raw.features.map((f, idx) => {
    const props = f.properties ?? {}
    const pick = (k: string) => {
      const v = props[k]
      return typeof v === 'string' && v && v !== '-99' ? v : undefined
    }
    const alpha2Raw = pick('ISO_A2') ?? pick('ISO_A2_EH') ?? pick('WB_A2') ?? pick('FIPS_10')
    const alpha2 = alpha2Raw ? alpha2Raw.toUpperCase() : null
    const hasData = !!(alpha2 && countries[alpha2])
    const name = (props['NAME'] ?? props['NAME_LONG'] ?? props['ADMIN'] ?? '') as string
    return {
      type: 'Feature' as const,
      id: alpha2 ?? `x${idx}`,
      geometry: f.geometry,
      properties: { name, code: alpha2, hasData },
    }
  })

  cachedGeo = { type: 'FeatureCollection', features }
  return cachedGeo
}


function WorldMapInner({
  onCountryClick,
  selectedCountry,
  flagColors,
  eligibleCountries,
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  const hoveredIdRef = useRef<string | null>(null)
  const selectedIdRef = useRef<string | null>(null)
  const eligibleRef = useRef<Set<string> | null>(eligibleCountries ?? null)
  const [tooltip, setTooltip] = useState<{
    name: string
    x: number
    y: number
    hasData: boolean
  } | null>(null)
  const [ready, setReady] = useState(false)

  // Stable ref to click handler so we don't recreate the map when it changes
  const clickHandlerRef = useRef(onCountryClick)
  useEffect(() => {
    clickHandlerRef.current = onCountryClick
  }, [onCountryClick])

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    const map = new maplibregl.Map({
      container: containerRef.current,
      // Minimal empty style — we render only our country polygons on a warm background.
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'ocean',
            type: 'background',
            paint: { 'background-color': COLOR_OCEAN },
          },
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [10, 25],
      zoom: 0,
      minZoom: 0,
      maxZoom: 6,
      renderWorldCopies: false,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchZoomRotate: true,
    })

    mapRef.current = map

    // Use mercator projection — cleaner rendering, no globe artifacts at low zoom.
    map.touchZoomRotate.disableRotation()
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768
    if (isDesktop) {
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false, visualizePitch: false }),
        'top-right'
      )
      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution:
            '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> · <a href="https://maplibre.org/" target="_blank" rel="noopener">MapLibre</a>',
        }),
        'bottom-right'
      )
    }



    map.on('load', async () => {
      // Fit the whole world into view once we know the container size.
      map.fitBounds(
        [
          [-170, -58],
          [190, 78],
        ],
        { padding: 10, animate: false, duration: 0 }
      )

      const geo = await loadCountriesGeoJSON()
      if (cancelled) return

      map.addSource('countries', {
        type: 'geojson',
        data: geo,
        promoteId: 'id',
      })

      // Fill layer — differentiates data-rich vs. empty countries, with hover + selected states.
      map.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            flagColors?.[0] ?? COLOR_LAND_HOVER,
            ['boolean', ['feature-state', 'hover'], false],
            COLOR_LAND_HOVER,
            ['get', 'hasData'],
            COLOR_LAND_DATA,
            COLOR_LAND_EMPTY,
          ],
          'fill-opacity': [
            'case',
            ['get', 'hasData'],
            0.92,
            0.55,
          ],
        },
      })

      map.addLayer({
        id: 'countries-outline',
        type: 'line',
        source: 'countries',
        paint: {
          'line-color': COLOR_BORDER,
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            2,
            0.4,
          ],
          'line-opacity': 0.35,
        },
      })

      map.on('mousemove', 'countries-fill', (e) => {
        if (!e.features?.length) return
        const feat = e.features[0] as MapGeoJSONFeature
        const id = feat.id as string | undefined
        const props = feat.properties as { name: string; hasData: boolean; code: string | null }
        map.getCanvas().style.cursor = props.hasData ? 'pointer' : ''

        if (hoveredIdRef.current && hoveredIdRef.current !== id) {
          map.setFeatureState(
            { source: 'countries', id: hoveredIdRef.current },
            { hover: false }
          )
        }
        if (id && props.hasData) {
          hoveredIdRef.current = id
          map.setFeatureState({ source: 'countries', id }, { hover: true })
        } else {
          hoveredIdRef.current = null
        }

        const rect = map.getCanvas().getBoundingClientRect()
        setTooltip({
          name: props.name,
          x: e.originalEvent.clientX - rect.left,
          y: e.originalEvent.clientY - rect.top,
          hasData: !!props.hasData,
        })
      })

      map.on('mouseleave', 'countries-fill', () => {
        map.getCanvas().style.cursor = ''
        if (hoveredIdRef.current) {
          map.setFeatureState(
            { source: 'countries', id: hoveredIdRef.current },
            { hover: false }
          )
          hoveredIdRef.current = null
        }
        setTooltip(null)
      })

      map.on('click', 'countries-fill', (e) => {
        if (!e.features?.length) return
        const feat = e.features[0]
        const props = feat.properties as { name: string; hasData: boolean; code: string | null }
        if (props.hasData && props.code) {
          clickHandlerRef.current(props.code, props.name)
        }
      })

      setReady(true)
    })

    return () => {
      cancelled = true
      map.remove()
      mapRef.current = null
    }
  }, [])
  // ^ We intentionally exclude flagColors here — updates handled below to avoid re-init.

  // Update selection + selected fill color when props change
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    const nextId = selectedCountry ?? null

    if (selectedIdRef.current && selectedIdRef.current !== nextId) {
      map.setFeatureState(
        { source: 'countries', id: selectedIdRef.current },
        { selected: false }
      )
    }

    if (nextId) {
      map.setFeatureState({ source: 'countries', id: nextId }, { selected: true })
    }
    selectedIdRef.current = nextId

    // Update fill color paint property so selected color reflects current flag
    if (map.getLayer('countries-fill')) {
      map.setPaintProperty('countries-fill', 'fill-color', [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        flagColors?.[0] ?? COLOR_LAND_HOVER,
        ['boolean', ['feature-state', 'hover'], false],
        COLOR_LAND_HOVER,
        ['get', 'hasData'],
        COLOR_LAND_DATA,
        COLOR_LAND_EMPTY,
      ])
    }
  }, [selectedCountry, flagColors, ready])

  return (
    <div className="relative w-full" style={{ aspectRatio: '16 / 10' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '1rem', overflow: 'hidden' }}>
        <div
          ref={containerRef}
          style={{ width: '100%', height: '100%', background: COLOR_OCEAN }}
        />
      </div>


      {tooltip && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 34,
            backgroundColor: tooltip.hasData ? '#0f172a' : '#475569',
            color: '#FFFFFF',
          }}
        >
          {tooltip.name}
          {tooltip.hasData && (
            <span className="ml-1.5 text-xs text-[#F2A65A]">Tap to explore</span>
          )}
        </div>
      )}
    </div>
  )
}

export const WorldMap = memo(WorldMapInner)
