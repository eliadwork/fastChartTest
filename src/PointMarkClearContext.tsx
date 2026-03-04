import { createContext, type ReactNode } from 'react'

type RemovePendingFn = () => void
type RemoveLastPendingFn = () => void
type ClearStateFn = () => void

const registry = new Map<
  string,
  { removePending: RemovePendingFn; removeLastPending: RemoveLastPendingFn; clearPendingState: ClearStateFn }
>()

export function registerForChart(
  chartId: string,
  removePending: RemovePendingFn,
  clearPendingState: ClearStateFn,
  removeLastPending?: RemoveLastPendingFn
): void {
  registry.set(chartId, {
    removePending,
    removeLastPending: removeLastPending ?? removePending,
    clearPendingState,
  })
}

export function removePendingForChart(chartId: string): void {
  registry.get(chartId)?.removePending()
}

export function removeLastPendingForChart(chartId: string): void {
  registry.get(chartId)?.removeLastPending()
}

export function clearPendingStateForChart(chartId: string): void {
  registry.get(chartId)?.clearPendingState()
}

export const PointMarkClearContext = createContext<{
  registerForChart: typeof registerForChart
  removePendingForChart: typeof removePendingForChart
  removeLastPendingForChart: typeof removeLastPendingForChart
  clearPendingStateForChart: typeof clearPendingStateForChart
}>({
  registerForChart,
  removePendingForChart,
  removeLastPendingForChart,
  clearPendingStateForChart,
})

export function PointMarkClearProvider({ children }: { children: ReactNode }) {
  return (
    <PointMarkClearContext.Provider
      value={{
        registerForChart,
        removePendingForChart,
        removeLastPendingForChart,
        clearPendingStateForChart,
      }}
    >
      {children}
    </PointMarkClearContext.Provider>
  )
}
