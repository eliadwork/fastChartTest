/**
 * Chart theme – colors and styling for the chart (SciChart).
 * Customize via createChartTheme() or pass overrides to ChartThemeProvider.
 */

export interface ChartTheme {
  /** Default colors for series when not specified per-series */
  defaultSeriesColors: string[]
  /** Chart background color */
  backgroundColor?: string
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
}

export const defaultChartTheme: ChartTheme = {
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
  pointMarkIcon: '📍',
  pointMarkIconColor: '#3388ff',
}

export function createChartTheme(overrides: Partial<ChartTheme> = {}): ChartTheme {
  return { ...defaultChartTheme, ...overrides }
}
