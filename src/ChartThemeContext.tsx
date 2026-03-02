import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { ChartTheme } from './chartTheme'
import { defaultChartTheme } from './chartTheme'

const ChartThemeContext = createContext<ChartTheme>(defaultChartTheme)

export interface ChartThemeProviderProps {
  theme?: Partial<ChartTheme>
  children: ReactNode
}

export function ChartThemeProvider({ theme: overrides, children }: ChartThemeProviderProps) {
  const theme = useMemo(
    () => ({ ...defaultChartTheme, ...overrides }),
    [overrides]
  )
  return (
    <ChartThemeContext.Provider value={theme}>
      {children}
    </ChartThemeContext.Provider>
  )
}

export function useChartTheme(): ChartTheme {
  return useContext(ChartThemeContext)
}
