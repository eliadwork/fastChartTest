import type { scichartData, SciChartDataBounds } from '../scichartOptions'

import { useMemo } from 'react'

export const useSciChartDataBounds = (data: scichartData): SciChartDataBounds => {
  return useMemo(() => {
    let xMin = Infinity
    let xMax = -Infinity
    let yMin = Infinity
    let yMax = -Infinity

    for (const series of data.series) {
      for (let index = 0; index < series.x.length; index++) {
        const value = series.x[index]
        if (Number.isFinite(value)) {
          if (value < xMin) xMin = value
          if (value > xMax) xMax = value
        }
      }

      for (let index = 0; index < series.y.length; index++) {
        const value = series.y[index]
        if (Number.isFinite(value)) {
          if (value < yMin) yMin = value
          if (value > yMax) yMax = value
        }
      }
    }

    return {
      xMin,
      xMax,
      yMin,
      yMax,
      hasValidBounds: Number.isFinite(xMin) && Number.isFinite(yMin),
    }
  }, [data])
}
