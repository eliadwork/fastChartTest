import { useCallback } from 'react'
import type { ChartDataLike } from '../utils/chartDataLookup'
import { getNearestPointAtX } from '../utils/chartDataLookup'

/**
 * Hook that returns a lookup function to get Y at X for a given series.
 * Use across multiple charts - pass the chart's data to get a lookup for that chart.
 */
export function useChartDataLookup(chartData: ChartDataLike | null) {
  return useCallback(
    (xValue: number, seriesIndex: number) => {
      if (!chartData) return null
      return getNearestPointAtX(chartData, xValue, seriesIndex)
    },
    [chartData]
  )
}
