import { useState, memo, useCallback } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import {
  countries,
  continentColors,
  getContinentForGeoId,
  isoAlpha2ToNumeric,
} from '@/data/countries'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const numericToAlpha2: Record<string, string> = {}
for (const [alpha2, numeric] of Object.entries(isoAlpha2ToNumeric)) {
  numericToAlpha2[numeric] = alpha2
}

const detailedCountryCodes = new Set(
  Object.keys(countries).map((c) => isoAlpha2ToNumeric[c]).filter(Boolean)
)

interface WorldMapProps {
  onCountryClick: (countryCode: string, countryName: string) => void
  selectedCountry: string | null
  flagColors: [string, string, string] | null
}

function WorldMapInner({ onCountryClick, selectedCountry, flagColors }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{
    name: string
    x: number
    y: number
    hasData: boolean
  } | null>(null)

  const selectedNumeric = selectedCountry
    ? isoAlpha2ToNumeric[selectedCountry]
    : null

  const handleClick = useCallback(
    (geo: { id: string; properties: { name: string } }) => {
      const alpha2 = numericToAlpha2[geo.id]
      if (alpha2 && countries[alpha2]) {
        onCountryClick(alpha2, geo.properties.name)
      }
    },
    [onCountryClick]
  )

  return (
    <div className="relative w-full" style={{ aspectRatio: '2 / 1' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 130,
          center: [0, 30],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoId = geo.id as string
                const continent = getContinentForGeoId(geoId)
                const isSelected = geoId === selectedNumeric
                const hasDetailedData = detailedCountryCodes.has(geoId)
                const baseColor = continentColors[continent] || '#CBD5E1'

                let fillColor = baseColor
                if (isSelected && flagColors) {
                  fillColor = flagColors[0]
                } else if (hasDetailedData) {
                  fillColor = baseColor
                } else {
                  fillColor = baseColor + '88'
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke={isSelected ? '#FFFFFF' : '#FFFFFF40'}
                    strokeWidth={isSelected ? 1.5 : 0.5}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'fill 0.2s ease',
                      },
                      hover: {
                        fill: hasDetailedData
                          ? flagColors && isSelected
                            ? flagColors[1] === '#FFFFFF'
                              ? flagColors[2]
                              : flagColors[1]
                            : '#0EA5E9'
                          : baseColor + 'CC',
                        outline: 'none',
                        cursor: hasDetailedData ? 'pointer' : 'default',
                        stroke: '#FFFFFF',
                        strokeWidth: 1,
                      },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={(e) => {
                      const rect = (
                        e.currentTarget.closest('svg') as SVGSVGElement
                      )?.getBoundingClientRect()
                      if (rect) {
                        setTooltip({
                          name: geo.properties.name,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                          hasData: hasDetailedData,
                        })
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() =>
                      handleClick({
                        id: geoId,
                        properties: geo.properties as { name: string },
                      })
                    }
                  />
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 30,
            backgroundColor: tooltip.hasData ? '#0f172a' : '#475569',
            color: '#FFFFFF',
          }}
        >
          {tooltip.name}
          {tooltip.hasData && (
            <span className="ml-1.5 text-xs text-sky-300">Click to explore</span>
          )}
        </div>
      )}
    </div>
  )
}

export const WorldMap = memo(WorldMapInner)
