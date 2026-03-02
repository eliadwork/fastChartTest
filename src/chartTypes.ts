/**
 * Generic chart types - library-agnostic interface for easy swapping.
 * Convert to library-specific formats inside each chart implementation.
 */

export interface GenericChartData {
  /** Shared x values for all series */
  x: ArrayLike<number> | number[]
  /** Y values per series. Each inner array has same length as x. Alias: ys */
  series?: ArrayLike<number>[] | number[][]
  /** Y values per series (alias for series, for compatibility) */
  ys?: ArrayLike<number>[] | number[][]
  /** Optional names per series (falls back to "Series 0", "Series 1", ...) */
  seriesNames?: string[]
  /** Optional colors per series (falls back to default palette) */
  seriesColors?: string[]
}

export interface GenericChartShape {
  color: string
  axis: 'x' | 'y'
  value: number
}

export interface GenericChartOptions {
  /** Enable resampling for performance (library-specific) */
  resampling?: boolean
  /** Resampling precision 0-2 (higher = more fidelity, slower) */
  resamplingPrecision?: number
  /** Reference lines to draw on the chart */
  shapes?: GenericChartShape[]
  /** Key to hold for axis stretch (box zoom is default drag) */
  stretchModifierKey?: 'Shift' | 'Ctrl' | 'Alt'
  /** Hover line color */
  rolloverLineStroke?: string
  /** Hover line dash pattern, e.g. [8, 4] for striped */
  rolloverLineStrokeDashArray?: number[]
  /** Per-series visibility: true = show, false = hide. Undefined = show. Enables legend checkboxes. */
  seriesVisibility?: boolean[]
}

export type ChartLibrary = 'scichart'

export interface ChartWrapperProps {
  data: GenericChartData
  options?: GenericChartOptions
  library?: ChartLibrary
  style?: React.CSSProperties
}

/** Convert ArrayLike to Float64Array (no-op if already Float64Array) */
export function toFloat64Array(arr: ArrayLike<number> | number[]): Float64Array {
  if (arr instanceof Float64Array) return arr
  return new Float64Array(arr)
}
