/**
 * Chart theme – colors and styling for the chart (SciChart).
 * Customize via createChartTheme() or pass overrides to ChartThemeProvider.
 */

import α from "color-alpha"
import { DEFAULT_POINT_MARK_ICON_SVG } from "./assets/pointMarkIcon"

export interface ChartTheme {
  /** Default colors for series when not specified per-series */
  defaultSeriesColors: string[]
  /** Base background color (injected from outside, e.g. palette.background.paper). Chart uses this with chartBackgroundOpacity; header uses it at 100%. */
  backgroundColor?: string
  /** Opacity for chart and legend background. Default 0.2 (20%). */
  chartBackgroundOpacity?: number
  /** Rollover/hover line stroke color */
  rolloverStroke?: string
  /** Rollover line dash. Default: { isDash: true, steps: [8, 4] } */
  rolloverDash?: { isDash: boolean; steps: number[] }
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

/** Add opacity to a color string (hex, rgb, rgba, hsl, named colors). */
export const withOpacity = (color: string, opacity: number) =>
  color ? α(color, opacity) : color

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
  rolloverDash: { isDash: true, steps: [8, 4] },
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
