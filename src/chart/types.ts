/**
 * Generic chart types - library-agnostic.
 * No implementation-specific references.
 */

export interface ChartLineStyle {
  color?: string
  thickness?: number
  /** Dash config: isDash enables dashed line, steps is the pattern (e.g. [6, 4] for striped). */
  dash?: DashConfig
  /** When false, series cannot be bound in the 3-click point mark flow. Default: true. */
  bindable?: boolean
}

export interface ChartRolloverStyle {
  show: boolean
  color: string
  dash: DashConfig
}

/** Chart style passed to Chart and implementations. */
export interface ChartStyle {
  backgroundColor: string
  rollover: ChartRolloverStyle
  textColor: string
  defaultChartLineStyles?: ChartLineStyle
  legendBackgroundColor?: string
  zeroLineColor?: string
  /** When true, only the chart is visible – no header, legend, or buttons. */
  chartOnly: boolean
}

/** One line/series in the chart. Each line has its own x, y, name, optional group key, and style. */
export interface ChartDataSeries {
  x: number[] | ArrayLike<number>
  y: number[] | ArrayLike<number>
  name: string
  lineGroupKey?: string
  style: ChartLineStyle
}

/** Chart data: array of lines, each with its own x, y, name, lineGroupKey, and style. */
export type ChartData = ChartDataSeries[]

export interface ChartLineShape {
  /** Explicit shape type; omit for shorthand. */
  shape?: 'line'
  color?: string
  axis: 'x' | 'y'
  value: number
  dash?: DashConfig
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
  dash?: DashConfig
}

export type ChartShape = ChartLineShape | ChartBoxShape

/** Unified dash config: isDash enables dashed line, steps is the pattern (e.g. [8, 4]). */
export interface DashConfig {
  isDash: boolean
  steps: number[]
}

export interface ChartMarkerShape {
  type: 'marker'
  x: number
  icon?: string
  color?: string
}

export type ModifierKey = 'Shift' | 'Ctrl' | 'Alt' |'rightClick' | 'leftClick'

export type StretchTrigger = ModifierKey | 'rightClick' | 'leftClick'

export interface ChartIcon {
  /** SVG string (preferred, use {{color}} for fill), image URL, or legacy character. */
  iconImage: string
  location: { x: number; y: number }
  color?: string
}

export interface ChartOptions {
  note?: string
  shapes?: ChartShape[]
  stretchTrigger?: string
  stretchEnable?: boolean
  panTrigger?: string
  panEnable?: boolean
  panKey?: ModifierKey
  clipZoomToData?: boolean
  resampling?: boolean
  resamplingPrecision?: number
  backgroundColor?: string
  textColor?: string
  zeroLineColor?: string
  legendBackgroundColor?: string
  defaultSeriesColors?: string[]
  defaultStrokeThickness?: number
  rolloverStroke?: string
  rolloverDash?: DashConfig
  rolloverShow?: boolean
  pointMarkIcon?: string
  pointMarkIconColor?: string
  pointMarkIconSize?: number
  icons?: ChartIcon[]
  seriesVisibility?: boolean[]
  seriesGroupKeys?: (string | undefined)[]
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
  onDisableAll?: () => void
  /** When true, hide legend and show only the chart surface. */
  chartOnly?: boolean
  onPointMark?: (
    xValue: number,
    yValue: number,
    context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }
  ) => ChartLineShape | ChartMarkerShape | (ChartLineShape | ChartMarkerShape)[] | null

  /** Internal: register clear callbacks for 3-click point mark flow. */
  pointMarkRegisterForClear?: (
    chartId: string,
    removePending: () => void,
    clearPendingState: () => void,
    removeLastPending?: () => void
  ) => void
}
