/**
 * Chart theme – colors and styling for the chart (SciChart).
 * Customize via createChartTheme() or pass overrides to ChartThemeProvider.
 */

/** Default point mark icon: SVG circle. Use {{color}} placeholder for fill (replaced at render). */
export const DEFAULT_POINT_MARK_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="{{color}}"/></svg>'

export interface ChartTheme {
  /** Default colors for series when not specified per-series */
  defaultSeriesColors: string[]
  /** Base background color (injected from outside, e.g. palette.background.paper). Chart uses this with chartBackgroundOpacity; header uses it at 100%. */
  backgroundColor?: string
  /** Opacity for chart and legend background. Default 0.2 (20%). */
  chartBackgroundOpacity?: number
  /** Rollover/hover line stroke color */
  rolloverStroke?: string
  /** Rollover line dash array */
  rolloverDash?: number[]
  /** Default stroke thickness for series */
  defaultStrokeThickness?: number
  /** Point mark icon (3-click pick) */
  pointMarkIcon?: string
  /** Point mark icon color */
  pointMarkIconColor?: string
  /** Icon size multiplier. 1 = default, 1.5 = 50% bigger. */
  pointMarkIconSize?: number
  /** Text color for header, axis labels (steps), and legend (graph names). Default: white. */
  textColor?: string
  /** Color for the zero axis lines (x=0, y=0). Default: white. */
  zeroLineColor?: string
}

/** Add opacity to a hex or rgb/rgba color string. */
export function withOpacity(color: string, opacity: number): string {
  if (!color) return color
  if (color.startsWith('#')) {
    const hex = color.slice(1).padEnd(6, '0')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${opacity})`
  }
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]},${opacity})`
  }
  return color
}

export const defaultChartTheme: ChartTheme = {
  chartBackgroundOpacity: 0.2,
  defaultSeriesColors: [
    '#3ca832',
    '#eb911c',
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
  ],
  rolloverStroke: '#FF0000',
  rolloverDash: [8, 4],
  defaultStrokeThickness: 2,
  pointMarkIcon: DEFAULT_POINT_MARK_ICON_SVG,
  pointMarkIconColor: '#3388ff',
  pointMarkIconSize: 1.5,
  textColor: '#ffffff',
  zeroLineColor: '#ffffff',
}

export function createChartTheme(overrides: Partial<ChartTheme> = {}): ChartTheme {
  return { ...defaultChartTheme, ...overrides }
}
