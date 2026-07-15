import { useEffect, useMemo, useState } from 'react'
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson'

// Same Natural Earth source as WorldMap — served from jsdelivr CDN, cached.
const GEO_URL =
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson'

const COLOR_OCEAN = '#EAD9BE'
const COLOR_LAND_NEIGHBOR = '#D9C4A3'
const COLOR_BORDER = '#1E2A44'
const COLOR_PIN = '#000000'
const COLOR_PIN_CENTER = '#FBF5EC'

interface PlaceMapProps {
  countryCode: string
  coords: { lat: number; lng: number }
  accentColor: string
}

type CountryGeoJSON = FeatureCollection<Geometry, { code: string | null }>
type ProjectedPoint = { x: number; y: number }
type ProjectedBounds = { minX: number; minY: number; maxX: number; maxY: number }

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

function project(pos: Position): ProjectedPoint {
  const lng = Number(pos[0])
  const lat = Math.max(-85.05112878, Math.min(85.05112878, Number(pos[1])))
  const rad = (lat * Math.PI) / 180

  return {
    x: lng,
    // Web Mercator, inverted so north is up in SVG coordinates.
    y: -(Math.log(Math.tan(Math.PI / 4 + rad / 2)) * 180) / Math.PI,
  }
}

function extendBounds(bounds: ProjectedBounds, point: ProjectedPoint) {
  bounds.minX = Math.min(bounds.minX, point.x)
  bounds.minY = Math.min(bounds.minY, point.y)
  bounds.maxX = Math.max(bounds.maxX, point.x)
  bounds.maxY = Math.max(bounds.maxY, point.y)
}

function featureBounds(feat: Feature<Geometry>): ProjectedBounds | null {
  const bounds: ProjectedBounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  }
  const g = feat.geometry
  const eachPos = (pos: Position) => extendBounds(bounds, project(pos))
  const eachRing = (ring: Position[]) => ring.forEach(eachPos)
  const eachPoly = (poly: Position[][]) => poly.forEach(eachRing)

  if (g.type === 'Polygon') eachPoly(g.coordinates)
  else if (g.type === 'MultiPolygon') g.coordinates.forEach(eachPoly)
  else return null
  return Number.isFinite(bounds.minX) ? bounds : null
}

function pathForGeometry(g: Geometry): string {
  const ringPath = (ring: Position[]) =>
    ring
      .map((pos, i) => {
        const p = project(pos)
        return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(3)} ${p.y.toFixed(3)}`
      })
      .join(' ') + ' Z'
  const polyPath = (poly: Position[][]) => poly.map(ringPath).join(' ')

  if (g.type === 'Polygon') return polyPath(g.coordinates)
  if (g.type === 'MultiPolygon') return g.coordinates.map(polyPath).join(' ')
  return ''
}

export function PlaceMap({ countryCode, coords, accentColor }: PlaceMapProps) {
  const [geo, setGeo] = useState<CountryGeoJSON | null>(cachedGeo)

  useEffect(() => {
    let cancelled = false
    loadGeo().then((nextGeo) => {
      if (!cancelled) setGeo(nextGeo)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const target = useMemo(
    () => geo?.features.find((f) => f.properties.code === countryCode) ?? null,
    [countryCode, geo]
  )

  const mapData = useMemo(() => {
    const marker = project([coords.lng, coords.lat])
    const baseBounds = target ? featureBounds(target) : null
    const bounds = baseBounds
      ? { ...baseBounds }
      : {
          minX: marker.x - 3.5,
          minY: marker.y - 3.5,
          maxX: marker.x + 3.5,
          maxY: marker.y + 3.5,
        }

    extendBounds(bounds, marker)

    const width = Math.max(bounds.maxX - bounds.minX, 1)
    const height = Math.max(bounds.maxY - bounds.minY, 1)
    const padX = Math.max(width * 0.08, 1)
    const padY = Math.max(height * 0.08, 1)
    const viewBoxWidth = width + padX * 2
    const viewBoxHeight = height + padY * 2
    const pinHeight = Math.max(Math.max(viewBoxWidth, viewBoxHeight) * 0.02, 0.25)
    const pinScale = pinHeight / 22
    const pinStroke = Math.max(pinHeight * 0.12, 0.04)
    const pinCenterRadius = Math.max(pinHeight * 0.11, 0.03)
    const lineWidth = Math.max(Math.max(viewBoxWidth, viewBoxHeight) * 0.0022, 0.18)

    return {
      marker,
      pinHeight,
      pinScale,
      pinStroke,
      pinCenterRadius,
      lineWidth,
      viewBox: `${bounds.minX - padX} ${bounds.minY - padY} ${viewBoxWidth} ${viewBoxHeight}`,
    }
  }, [coords.lat, coords.lng, target])

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[#1E2A44]/10" style={{ aspectRatio: '4 / 3' }}>
      <svg
        role="img"
        aria-label={`Map showing this place within ${countryCode}`}
        viewBox={mapData.viewBox}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        style={{ background: COLOR_OCEAN }}
      >
        {geo?.features.map((feature, index) => {
          const isTarget = feature.properties.code === countryCode
          if (isTarget) return null
          const path = pathForGeometry(feature.geometry)
          if (!path) return null
          return (
            <path
              key={feature.properties.code ?? `${index}-${path.slice(0, 24)}`}
              d={path}
              fill={COLOR_LAND_NEIGHBOR}
              fillOpacity={0.58}
              fillRule="evenodd"
              stroke={COLOR_BORDER}
              strokeOpacity={0.22}
              strokeWidth={mapData.lineWidth * 0.55}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}

        {target && (
          <path
            d={pathForGeometry(target.geometry)}
            fill={accentColor}
            fillOpacity={0.68}
            fillRule="evenodd"
            stroke={COLOR_BORDER}
            strokeOpacity={0.75}
            strokeWidth={mapData.lineWidth}
            vectorEffect="non-scaling-stroke"
          />
        )}

        <g
          transform={`translate(${mapData.marker.x - 12 * mapData.pinScale}, ${mapData.marker.y - 22 * mapData.pinScale}) scale(${mapData.pinScale})`}
        >
          <path
            d="M12 2 C8.13 2 5 5.13 5 9 c0 5.25 7 13 7 13 s7-7.75 7-13 c0-3.87-3.13-7-7-7 z"
            fill={accentColor}
            stroke={COLOR_BORDER}
            strokeWidth={mapData.pinStroke}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <circle
          cx={mapData.marker.x}
          cy={mapData.marker.y - mapData.pinHeight / 2}
          r={mapData.pinCenterRadius}
          fill="#FBF5EC"
          stroke={COLOR_BORDER}
          strokeWidth={mapData.pinStroke * 0.7}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
