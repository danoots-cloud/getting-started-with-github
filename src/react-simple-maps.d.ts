declare module 'react-simple-maps' {
  import type { ComponentType, ReactNode, CSSProperties } from 'react'

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: {
      scale?: number
      center?: [number, number]
      rotate?: [number, number, number]
    }
    width?: number
    height?: number
    style?: CSSProperties
    children?: ReactNode
  }

  interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    children?: ReactNode
  }

  interface GeographiesProps {
    geography: string | object
    children: (data: { geographies: GeographyObject[] }) => ReactNode
  }

  interface GeographyObject {
    rsmKey: string
    id: string
    properties: Record<string, string>
    type: string
    geometry: object
  }

  interface GeographyStyleObject {
    outline?: string
    fill?: string
    stroke?: string
    strokeWidth?: number
    cursor?: string
    transition?: string
  }

  interface GeographyProps {
    geography: GeographyObject
    key?: string
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: GeographyStyleObject
      hover?: GeographyStyleObject
      pressed?: GeographyStyleObject
    }
    onMouseEnter?: (event: React.MouseEvent<SVGPathElement>) => void
    onMouseLeave?: (event: React.MouseEvent<SVGPathElement>) => void
    onClick?: (event: React.MouseEvent<SVGPathElement>) => void
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
}
