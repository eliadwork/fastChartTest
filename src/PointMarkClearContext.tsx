import { createContext, type ReactNode } from 'react';

type RemovePendingForChartFn = (chartId: string) => void;
type RemoveLastPendingForChartFn = (chartId: string) => void;
type ClearPendingStateForChartFn = (chartId: string) => void;

export function removePendingForChart(_chartId: string): void {
  // No-op: shapes come from options.shapes; clearing is done via store
}

export function removeLastPendingForChart(_chartId: string): void {
  // No-op: cancelSeriesPickerWithoutChoice restores state; shapes come from options.shapes
}

export function clearPendingStateForChart(_chartId: string): void {
  // No-op: shapes come from options.shapes; store clears on modal open
}

export const PointMarkClearContext = createContext<{
  removePendingForChart: RemovePendingForChartFn;
  removeLastPendingForChart: RemoveLastPendingForChartFn;
  clearPendingStateForChart: ClearPendingStateForChartFn;
}>({
  removePendingForChart,
  removeLastPendingForChart,
  clearPendingStateForChart,
});

export const PointMarkClearProvider = ({ children }: { children: ReactNode }) => {
  return (
    <PointMarkClearContext.Provider
      value={{
        removePendingForChart,
        removeLastPendingForChart,
        clearPendingStateForChart,
      }}
    >
      {children}
    </PointMarkClearContext.Provider>
  );
};
