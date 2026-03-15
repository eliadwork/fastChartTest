import type * as React from 'react'
import type { EResamplingMode } from 'scichart'

import type { DashConfig, TriggerKey } from '../../types'

export interface scichartFullDefinition {
  data: scichartData
  shapes: sciChartShape[]
  icons: sciChartIcon[]
  note?: string
  options: SciChartOptions
  styles: scichartStyles
}

// data definition
export interface scichartData {
  series: scichartDataSeries[]
  seriesVisibility: boolean[]
}

export interface scichartDataSeries {
  x: Float64Array
  y: Float64Array
  name: string
  lineGroupKey?: string
  style: sciChartLineStyle
}

export interface sciChartLineStyle {
  color?: string
  thickness?: number
  /** Dash config: isDash enables dashed line, steps is the pattern (e.g. [6, 4] for striped). */
  dash?: sciChartDashConfig
}

export interface sciChartDashConfig {
  isDash: boolean
  steps: number[]
}

// shapes definition
export interface sciChartLineShape {
  /** Explicit shape type; omit for shorthand. */
  shape?: 'line'
  color?: string
  axis: 'x' | 'y'
  value: number
  dash?: DashConfig
}

export interface sciChartBoxShape {
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
  dash?: DashConfig
}

export type sciChartShape = sciChartLineShape | sciChartBoxShape

// icons definition
export interface sciChartIcon {
  /** SVG string (preferred, use {{color}} for fill), image URL, or legacy character. */
  iconImage: string
  location: { x: number; y: number }
  color?: string
}

// options definition
export interface SciChartOptions {
  features: sciChartFeaturesOptions
  resampling: sciChartResamplingOption
  events?: sciChartOptionsEvents
  clipZoomToData: boolean
}

export interface sciChartFeaturesOptions {
  stretch: featureKeyEnabling
  pan: featureKeyEnabling
  rollover: sciChartRolloverConfig
}

export interface sciChartResamplingOption {
  resamplingMode: EResamplingMode
  resamplingPrecision: number
}

export interface sciChartOptionsEvents {
  clicks: sciChartClickEvents
  keys: sciChartKeyEvents
  zoom: sciChartZoomCallbacks
  scroll: (event: WheelEvent) => void
}
export interface sciChartClickEvents {
  right: (event: MouseEvent) => void
  left: (event: MouseEvent) => void
  double: (event: MouseEvent) => void
  middle: (event: MouseEvent) => void
}

export interface sciChartKeyEvents {
  shift: (event: MouseEvent) => void
  ctrl: (event: MouseEvent) => void
  alt: (event: MouseEvent) => void
}
export interface sciChartZoomCallbacks {
  setZoomBack: (fn: () => void) => void
  setZoomReset: (fn: () => void) => void
  setCanZoomBack: (can: boolean) => void
  setPushBeforeReset: (fn: () => void) => void
  pushBeforeResetRef: React.MutableRefObject<(() => void) | null>
}

// styles definition
export interface scichartStyles {
  chartOnly: boolean
  backgroundColor: string
  textColor: string
  zeroLineColor: string
  defaultStyles: scichartDefaultStyles
}
export interface scichartDefaultStyles {
  seriesColors: string[]
  strokeThickness: number
  iconColor: string
}

export interface sciChartRolloverConfig {
  show: boolean
  color: string
  dash: sciChartDashConfig
}
export interface featureKeyEnabling {
  enable: boolean
  trigger: TriggerKey
}

export interface SciChartDataBounds {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  hasValidBounds: boolean
}
