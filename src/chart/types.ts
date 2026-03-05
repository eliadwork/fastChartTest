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

export type ModifierKey = 'Shift' | 'Ctrl' | 'Alt'

export type StretchTrigger = ModifierKey | 'rightClick'

export interface ChartIcon {
  /** SVG string (preferred, use {{color}} for fill), image URL, or legacy character. */
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
  /** Rollover/hover line dash. Default: { isDash: true, steps: [8, 4] } */
  rolloverDash?: DashConfig
  backgroundColor?: string
  /** Legend (glossary) background color. Defaults to same as chart (backgroundColor with chartBackgroundOpacity). */
  legendBackgroundColor?: string
  /** Text color for header, axis labels, and legend. Default: white. */
  textColor?: string
  seriesVisibility?: boolean[]
  seriesLines?: ChartLineStyle[]
  defaultSeriesColors?: string[]
  defaultStrokeThickness?: number
  resampling?: boolean
  resamplingPrecision?: number
  onPointMark?: (
    xValue: number,
    yValue: number,
    context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }
  ) => ChartLineShape | ChartMarkerShape | (ChartLineShape | ChartMarkerShape)[] | null
  /** Icon for the middle-click marker (3-click pick). E.g. '●' for circle. Default: '📍' */
  pointMarkIcon?: string
  /** Color for the point mark icon. Default: '#3388ff' */
  pointMarkIconColor?: string
  /** Icon size multiplier. 1 = default, 1.5 = 50% bigger. Default: 1.5. */
  pointMarkIconSize?: number
  /** Icons rendered at chart locations. iconImage: SVG string, image URL, or character. color for character fallback. */
  icons?: ChartIcon[]
  /** @deprecated Use icons instead. Markers from 3-click flow. */
  pointMarkers?: Array<{ x: number; y: number; icon?: string; color?: string }>
  /** When true, zoom/pan cannot go outside the data bounds. Default: true */
  clipZoomToData?: boolean
  /** Color for the zero axis lines (x=0, y=0). Default: white. */
  zeroLineColor?: string
  /** Called when user toggles series visibility via legend. Keeps state in sync. */
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  /** Called when user toggles a group via legend. */
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
  /** Internal: register clear callbacks for 3-click point mark flow. */
  pointMarkRegisterForClear?: (
    chartId: string,
    removePending: () => void,
    clearPendingState: () => void,
    removeLastPending?: () => void
  ) => void
}
