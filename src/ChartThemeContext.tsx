import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { ChartTheme, ChartThemeOverrides } from './chartTheme'
import { defaultChartTheme } from './chartTheme'

const ChartThemeContext = createContext<ChartTheme>(defaultChartTheme)

export interface ChartThemeProviderProps {
  theme?: ChartThemeOverrides
  children: ReactNode
}

export const ChartThemeProvider = ({ theme: overrides, children }: ChartThemeProviderProps) => {
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
