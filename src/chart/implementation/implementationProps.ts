/**
 * Chart implementation props.
 * Every chart implementation receives these same props and converts them internally.
 */

import type { ChartData, ChartIcon, ChartRolloverStyle, ChartShape, ChartStyle } from '../types'

export type TriggerKey = 'rightClick' | 'leftClick' | 'shift' | 'ctrl' | 'alt'

export type KeyTriggeredOption = {
  enable: boolean
  trigger: TriggerKey
}

export type ChartImplementationTriggerKey = TriggerKey
export type ChartImplementationRolloverStyle = ChartRolloverStyle
export type ChartImplementationStyle = ChartStyle

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
  stretch?: KeyTriggeredOption
  pan?: KeyTriggeredOption
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
export interface ChartImplementationOptions {
  shapes?: ChartShape[]
  icons?: ChartIcon[]
  note?: string
  stretch: KeyTriggeredOption
  pan: KeyTriggeredOption
  resampling: ChartImplementationResampling
  clipZoomToData: boolean
  seriesVisibility: boolean[]
  seriesGroupKeys?: (string | undefined)[]
  events?: ChartImplementationEvents
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
  onDisableAll?: () => void
}

export interface ChartZoomCallbacks {
  setZoomBack: (fn: () => void) => void
  setZoomReset: (fn: () => void) => void
  setCanZoomBack: (can: boolean) => void
  setPushBeforeReset: (fn: () => void) => void
  pushBeforeResetRef: React.MutableRefObject<(() => void) | null>
}

export interface ChartImplementationProps {
  chartId?: string
  lines: ChartData
  style: ChartImplementationStyle
  options?: ChartImplementationOptionsOverrides
  /** Callbacks for zoom back/reset. When provided, toolbar uses local state instead of global stores. */
  zoomCallbacks?: ChartZoomCallbacks
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
