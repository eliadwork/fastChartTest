import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'

import { CHART_LEGEND_THEME_DEFAULTS } from './chart/scichart/components/Legend/legendConstants'

declare module '@mui/material/styles' {
  interface Theme {
    chartLegend: {
      zIndex: number
      inset: number
      gap: number
      padding: number
      paddingBlock: number
      borderRadius: number
      groupGap: number
      itemPaddingBlock: number
      fontSize: number
      defaultBackground: string
      defaultTextColor: string
    }
  }
  interface ThemeOptions {
    chartLegend?: {
      zIndex?: number
      inset?: number
      gap?: number
      padding?: number
      paddingBlock?: number
      borderRadius?: number
      groupGap?: number
      itemPaddingBlock?: number
      fontSize?: number
      defaultBackground?: string
      defaultTextColor?: string
    }
  }
}

const defaultThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: {
      default: '#242424',
      paper: '#1a1a1a',
    },
    primary: {
      main: '#646cff',
    },
  },
  chartLegend: CHART_LEGEND_THEME_DEFAULTS,
}

/** Create MUI theme. Pass partial overrides to customize. */
export function createAppTheme(overrides: ThemeOptions = {}) {
  return createTheme({
    ...defaultThemeOptions,
    ...overrides,
    palette: overrides.palette
      ? { ...defaultThemeOptions.palette, ...overrides.palette }
      : defaultThemeOptions.palette,
  })
}

/** Default theme instance */
export const theme = createAppTheme()
