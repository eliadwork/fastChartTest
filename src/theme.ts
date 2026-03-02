import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'

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
