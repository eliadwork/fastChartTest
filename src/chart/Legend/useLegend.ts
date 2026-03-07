import { useCallback, useContext, useEffect, useState } from 'react'
import { SciChartSurface } from 'scichart'
import { SciChartSurfaceContext } from 'scichart-react'

import {
  LEGEND_SERIES_NAME_PREFIX,
  LEGEND_DEFAULT_STROKE,
  LEGEND_DEFAULT_STROKE_THICKNESS,
} from './legendConstants'

export interface SeriesInfo {
  name: string
  stroke: string
  strokeDashArray?: number[]
  strokeThickness: number
  isVisible: boolean
  index: number
}

export interface LegendGroup {
  name: string
  seriesIndices: number[]
}

export interface UseLegendOptions {
  seriesVisibility?: boolean[]
  seriesGroupKeys?: (string | undefined)[]
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
}

export const useLegend = ({
  seriesVisibility,
  seriesGroupKeys,
  onSeriesVisibilityChange,
  onSeriesVisibilityGroupChange,
}: UseLegendOptions) => {
  const initResult = useContext(SciChartSurfaceContext)
  const [, forceUpdate] = useState(0)

  const surface = initResult?.sciChartSurface as SciChartSurface | undefined

  useEffect(() => {
    const id = requestAnimationFrame(() => forceUpdate((n) => n + 1))
    return () => cancelAnimationFrame(id)
  }, [seriesVisibility])

  const seriesList: SeriesInfo[] = []

  if (surface) {
    const arr = surface.renderableSeries.asArray()
    for (let index = 0; index < arr.length; index++) {
      const series = arr[index] as {
        stroke: string
        strokeThickness?: number
        strokeDashArray?: number[]
        isVisible: boolean
        dataSeries?: { dataSeriesName?: string }
      }
      const name = series.dataSeries?.dataSeriesName ?? `${LEGEND_SERIES_NAME_PREFIX} ${index}`
      seriesList.push({
        name,
        stroke: series.stroke ?? LEGEND_DEFAULT_STROKE,
        strokeDashArray: series.strokeDashArray,
        strokeThickness: series.strokeThickness ?? LEGEND_DEFAULT_STROKE_THICKNESS,
        isVisible: series.isVisible,
        index,
      })
    }
  }

  const handleClick = useCallback(
    (index: number) => {
      if (!surface) return
      const series = surface.renderableSeries.asArray()[index] as { isVisible: boolean }
      if (!series) return
      const newVal = !series.isVisible
      series.isVisible = newVal
      surface.invalidateElement()
      onSeriesVisibilityChange?.(index, newVal)
      forceUpdate((n) => n + 1)
    },
    [surface, onSeriesVisibilityChange]
  )

  const handleGroupClick = useCallback(
    (indices: number[]) => {
      if (!surface) return
      const arr = surface.renderableSeries.asArray()
      const anyVisible = indices.some((index) => (arr[index] as { isVisible: boolean })?.isVisible)
      const newVal = !anyVisible
      for (const index of indices) {
        const series = arr[index] as { isVisible: boolean }
        if (series) series.isVisible = newVal
      }
      surface.invalidateElement()
      onSeriesVisibilityGroupChange?.(indices, newVal)
      forceUpdate((n) => n + 1)
    },
    [surface, onSeriesVisibilityGroupChange]
  )

  const groups: LegendGroup[] = []
  const seenKeys = new Map<string, number>()
  const groupedIndices = new Set<number>()
  for (let index = 0; index < seriesList.length; index++) {
    const key = seriesGroupKeys?.[index]
    if (key != null && key !== '') {
      groupedIndices.add(index)
      const groupIndex = seenKeys.get(key)
      if (groupIndex !== undefined) {
        groups[groupIndex]!.seriesIndices.push(index)
      } else {
        seenKeys.set(key, groups.length)
        groups.push({ name: key, seriesIndices: [index] })
      }
    }
  }
  const ungrouped = seriesList.filter((series) => !groupedIndices.has(series.index))

  return {
    seriesList,
    groups,
    ungrouped,
    handleClick,
    handleGroupClick,
  }
}
