/**
 * Types for SciChartWrapper – generic interface for chart configuration.
 */

import type { ChartIcon, ChartLineStyle, ChartShape, DashConfig } from '../types'
import type { ConvertedSeries } from '../convert'

export type TriggerKey = 'rightClick' | 'leftClick' | 'shift' | 'ctrl' | 'alt'

export interface SciChartWrapperRolloverStyle {
  show: boolean
  color: string
  dash: DashConfig
}

export interface SciChartWrapperStyle {
  backgroundColor: string
  rollover: SciChartWrapperRolloverStyle
  textColor: string
  defaultChartLineStyles?: ChartLineStyle
  legendBackgroundColor?: string
  zeroLineColor?: string
  /** When true, only the chart is visible – no header, legend, or buttons. */
  chartOnly: boolean
}

export interface SciChartWrapperStretch {
  enable: boolean
  trigger: TriggerKey
}

export interface SciChartWrapperPan {
  enable: boolean
  trigger: TriggerKey
}

export interface SciChartWrapperResampling {
  enable: boolean
  precision: number
}

export interface SciChartWrapperEvents {
  onrightclick?: (event: MouseEvent) => void
  onleftclick?: (event: MouseEvent) => void
  onshiftclick?: (event: MouseEvent) => void
  onctrlclick?: (event: MouseEvent) => void
  onaltclick?: (event: MouseEvent) => void
  onscroll?: (event: WheelEvent) => void
  ondoubleclick?: (event: MouseEvent) => void
  onzoom?: (event: MouseEvent) => void
  onzoomback?: () => void
  onzoomreset?: () => void
  /** Middle-click (scroll wheel click) – used for point mark injection from detect.tsx */
  onmiddleclick?: (
    xValue: number,
    yValue: number,
    context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }
  ) => unknown
}

export interface SciChartWrapperOptions {
  shapes?: ChartShape[]
  icons?: ChartIcon[]
  note?: string
  stretch: SciChartWrapperStretch
  pan: SciChartWrapperPan
  resampling: SciChartWrapperResampling
  clipZoomToData: boolean
  seriesVisibility?: boolean[]
  seriesGroupKeys?: (string | undefined)[]
  events?: SciChartWrapperEvents
  /** Parent provides these – SciChartWrapper passes through to chart. */
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
  onDisableAll?: () => void
}

/** Options overrides – all optional. Used when caller provides a subset. */
export interface SciChartWrapperOptionsOverrides {
  shapes?: ChartShape[]
  icons?: ChartIcon[]
  note?: string
  stretch?: SciChartWrapperStretch
  pan?: SciChartWrapperPan
  resampling?: SciChartWrapperResampling
  clipZoomToData?: boolean
  seriesVisibility?: boolean[]
  seriesGroupKeys?: (string | undefined)[]
  events?: SciChartWrapperEvents
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
  onDisableAll?: () => void
}

export interface SciChartWrapperProps {
  chartId?: string
  lines: ConvertedSeries[]
  style: SciChartWrapperStyle
  options?: SciChartWrapperOptionsOverrides
  /** CSS style for the wrapper container */
  containerStyle?: React.CSSProperties
  /** Optional overlay slot (e.g. legend) – rendered inside SciChartReact. Parent provides this. */
  overlaySlot?: React.ReactNode
  /** When true, show loader instead of chart. */
  loading?: boolean
}
