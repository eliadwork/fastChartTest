/**
 * Generic chart types - library-agnostic.
 * No implementation-specific references.
 */

export interface ChartData {
  /** Shared x values for all series */
  x: ArrayLike<number> | number[]
  /** Y values per series. Alias: series */
  ys?: ArrayLike<number>[] | number[][]
  series?: ArrayLike<number>[] | number[][]
  seriesNames?: string[]
  seriesColors?: string[]
}

export interface ChartLineShape {
  shape?: 'line'
  color: string
  axis: 'x' | 'y'
  value: number
  strokeDashArray?: number[]
}

export interface ChartBoxShape {
  shape: 'box'
  name?: string
  color: string
  fill?: string
  coordinates: {
    x1?: number
    x2?: number
    y1?: number
    y2?: number
  }
  strokeDashArray?: number[]
}

export type ChartShape = ChartLineShape | ChartBoxShape

export interface ChartMarkerShape {
  type: 'marker'
  x: number
  icon?: string
  color?: string
}

export interface ChartLineStyle {
  color?: string
  thickness?: number
  dash?: number[]
  /** When true, applies a dashed pattern [6, 4] for a striped look */
  striped?: boolean
}

export type ModifierKey = 'Shift' | 'Ctrl' | 'Alt'

export type StretchTrigger = ModifierKey | 'rightClick'

export interface ChartIcon {
  iconImage: string
  location: { x: number; y: number }
  color?: string
}

export interface ChartOptions {
  shapes?: ChartShape[]
  note?: string
  /** Modifier key for stretch zoom, or 'rightClick' for right-click drag. Default: 'rightClick' */
  stretchTrigger?: StretchTrigger
  /** Pan trigger: 'leftClick' for drag-to-pan, or modifier key (e.g. 'Alt'). Default: 'leftClick' */
  panTrigger?: 'leftClick' | ModifierKey
  /** @deprecated Use panTrigger instead */
  panKey?: ModifierKey
  rolloverStroke?: string
  rolloverDash?: number[]
  backgroundColor?: string
  seriesVisibility?: boolean[]
  seriesLines?: ChartLineStyle[]
  defaultSeriesColors?: string[]
  defaultStrokeThickness?: number
  resampling?: boolean
  resamplingPrecision?: number
  onPointMark?: (xValue: number, yValue: number) => ChartLineShape | ChartMarkerShape | (ChartLineShape | ChartMarkerShape)[] | null
  /** Icon for the middle-click marker (3-click pick). E.g. '●' for circle. Default: '📍' */
  pointMarkIcon?: string
  /** Color for the point mark icon. Default: '#3388ff' */
  pointMarkIconColor?: string
  /** Icons rendered at chart locations. iconImage: SVG string, image URL, or character. color for character fallback. */
  icons?: ChartIcon[]
  /** @deprecated Use icons instead. Markers from 3-click flow. */
  pointMarkers?: Array<{ x: number; y: number; icon?: string; color?: string }>
  /** When true, zoom/pan cannot go outside the data bounds. Default: true */
  clipZoomToData?: boolean
}

export interface ChartProps {
  data: ChartData
  options?: ChartOptions
  style?: React.CSSProperties
  lines?: ChartLineStyle[]
}
