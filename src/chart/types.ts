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

export interface ChartShape {
  color: string
  axis: 'x' | 'y'
  value: number
  strokeDashArray?: number[]
}

export interface ChartLineStyle {
  color?: string
  thickness?: number
  dash?: number[]
}

export type ModifierKey = 'Shift' | 'Ctrl' | 'Alt'

export interface ChartOptions {
  shapes?: ChartShape[]
  stretchKey?: ModifierKey
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
  onPointMark?: (xValue: number) => ChartShape | ChartShape[] | null
  /** When true, zoom/pan cannot go outside the data bounds. Default: true */
  clipZoomToData?: boolean
}

export interface ChartProps {
  data: ChartData
  options?: ChartOptions
  style?: React.CSSProperties
  lines?: ChartLineStyle[]
}
