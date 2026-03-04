import { createContext, type ReactNode } from 'react'

type RemovePendingFn = () => void
type ClearStateFn = () => void

const registry = new Map<string, { removePending: RemovePendingFn; clearPendingState: ClearStateFn }>()

export function registerForChart(
  chartId: string,
  removePending: RemovePendingFn,
  clearPendingState: ClearStateFn
): void {
  registry.set(chartId, { removePending, clearPendingState })
}

export function removePendingForChart(chartId: string): void {
  registry.get(chartId)?.removePending()
}

export function clearPendingStateForChart(chartId: string): void {
  registry.get(chartId)?.clearPendingState()
}

export const PointMarkClearContext = createContext<{
  registerForChart: typeof registerForChart
  removePendingForChart: typeof removePendingForChart
  clearPendingStateForChart: typeof clearPendingStateForChart
}>({
  registerForChart,
  removePendingForChart,
  clearPendingStateForChart,
})

export function PointMarkClearProvider({ children }: { children: ReactNode }) {
  return (
    <PointMarkClearContext.Provider
      value={{
        registerForChart,
        removePendingForChart,
        clearPendingStateForChart,
      }}
    >
      {children}
    </PointMarkClearContext.Provider>
  )
}
