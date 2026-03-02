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
  /** Dash pattern for line, e.g. [8, 4] for dashed. Omit for solid. */
  strokeDashArray?: number[]
}

/** Per-series line styling. All fields optional; falls back to defaults. */
export interface GenericLineStyle {
  color?: string
  thickness?: number
  dash?: number[]
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
  /** Chart background color (HTML color code, e.g. '#ffffff' or 'transparent') */
  backgroundColor?: string
  /** Per-series line styling: color, thickness, dash. Injected from outside the wrapper. */
  seriesLines?: GenericLineStyle[]
  /** Optional: called on chart click with x value. Handler returns shape(s) to inject. */
  onPointMark?: (xValue: number) => GenericChartShape | GenericChartShape[] | null
}

export type ChartLibrary = 'scichart'

export interface ChartWrapperProps {
  data: GenericChartData
  options?: GenericChartOptions
  library?: ChartLibrary
  style?: React.CSSProperties
  /** Shorthand: inject line styles from outside. Merged with options.seriesLines. */
  lines?: GenericLineStyle[]
}

/** Convert ArrayLike to Float64Array (no-op if already Float64Array) */
export function toFloat64Array(arr: ArrayLike<number> | number[]): Float64Array {
  if (arr instanceof Float64Array) return arr
  return new Float64Array(arr)
}
