/**
 * Chart implementation props.
 * Every chart implementation (e.g. SciChartWrapper) receives these props.
 * Style and options are generic – each implementation defines its own types.
 */

import type { ChartData } from '../types'

export interface ChartImplementationProps<TStyle, TOptions = Record<string, unknown>> {
  chartId?: string
  data: ChartData
  style: TStyle
  options?: TOptions
  /** CSS style for the wrapper container */
  containerStyle?: React.CSSProperties
  /**
   * Optional overlay slot (e.g. legend) – rendered inside the chart surface.
   * Parent provides this.
   */
  overlaySlot?: React.ReactNode
  /** When true, show loader instead of chart. */
  loading?: boolean
}
