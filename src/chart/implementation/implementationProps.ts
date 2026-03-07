/**
 * Chart implementation props.
 * Every chart implementation receives these same props and converts them internally.
 */

import type { ChartData, ChartIcon, ChartLineStyle, ChartShape, DashConfig } from '../types'

export type ChartImplementationTriggerKey = 'rightClick' | 'leftClick' | 'shift' | 'ctrl' | 'alt'

export interface ChartImplementationRolloverStyle {
  show: boolean
  color: string
  dash: DashConfig
}

export interface ChartImplementationStyle {
  backgroundColor: string
  rollover: ChartImplementationRolloverStyle
  textColor: string
  defaultChartLineStyles?: ChartLineStyle
  legendBackgroundColor?: string
  zeroLineColor?: string
  /** When true, only the chart is visible – no header, legend, or buttons. */
  chartOnly: boolean
}

export interface ChartImplementationStretch {
  enable: boolean
  trigger: ChartImplementationTriggerKey
}

export interface ChartImplementationPan {
  enable: boolean
  trigger: ChartImplementationTriggerKey
}

export interface ChartImplementationResampling {
  enable: boolean
  precision: number
}

export interface ChartImplementationEvents {
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
  onmiddleclick?: (
    xValue: number,
    yValue: number,
    context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }
  ) => unknown
}

export interface ChartImplementationOptionsOverrides {
  shapes?: ChartShape[]
  icons?: ChartIcon[]
  note?: string
  stretch?: ChartImplementationStretch
  pan?: ChartImplementationPan
  resampling?: ChartImplementationResampling
  clipZoomToData?: boolean
  seriesVisibility?: boolean[]
  seriesGroupKeys?: (string | undefined)[]
  events?: ChartImplementationEvents
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
  onDisableAll?: () => void
}

/** Full options after defaults are applied. Used internally by implementations. */
export interface ChartImplementationOptions extends ChartImplementationOptionsOverrides {
  stretch: ChartImplementationStretch
  pan: ChartImplementationPan
  resampling: ChartImplementationResampling
  clipZoomToData: boolean
}

export interface ChartImplementationProps {
  chartId?: string
  data: ChartData
  style: ChartImplementationStyle
  options?: ChartImplementationOptionsOverrides
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
