import { useContext, useEffect } from 'react'
import {
  FastLineRenderableSeries,
  NumberRange,
  SciChartSurface,
  type EResamplingMode,
  XyDataSeries,
} from 'scichart'
import { SciChartSurfaceContext } from 'scichart-react'

import type { ConvertedData, ConvertedSeries } from '../convert'
import { dashToStrokeArray } from '../convert'
import type { SciChartDataBounds } from './useSciChartDataBounds'
import type { SciChartSeriesConfig } from './useSciChartSeriesConfig'
import { SCI_CHART_VISIBLE_RANGE_PAD_FACTOR } from '../sciChartWrapperConstants'

interface SciChartSeriesLike {
  dataSeries?: { delete?: () => void }
  delete?: () => void
}

const toStrokeColor = (
  line: ConvertedSeries,
  index: number,
  seriesConfig: SciChartSeriesConfig
) => line.style.color ?? seriesConfig.seriesColors[index % seriesConfig.seriesColors.length]

const toStrokeThickness = (line: ConvertedSeries, seriesConfig: SciChartSeriesConfig) =>
  line.style.thickness ?? seriesConfig.strokeThickness

const toSeriesVisibility = (seriesVisibility: boolean[] | undefined, index: number) =>
  seriesVisibility?.[index] ?? true

const getPaddedLimit = (value: number) =>
  value === 0 ? 1 : Math.abs(value) * SCI_CHART_VISIBLE_RANGE_PAD_FACTOR

const disposeRenderableSeries = (series: SciChartSeriesLike) => {
  series.dataSeries?.delete?.()
  series.delete?.()
}

const clearRenderableSeries = (surface: SciChartSurface) => {
  const previousSeries = surface.renderableSeries.asArray() as SciChartSeriesLike[]
  for (const series of previousSeries) {
    disposeRenderableSeries(series)
  }
  surface.renderableSeries.clear()
}

interface AxisWithVisibleRangeLimit {
  visibleRangeLimit?: NumberRange
}

const applyVisibleRangeLimits = (
  surface: SciChartSurface,
  dataBounds: SciChartDataBounds,
  clipZoomToData: boolean
) => {
  const xAxis = surface.xAxes.asArray()[0] as AxisWithVisibleRangeLimit | undefined
  const yAxis = surface.yAxes.asArray()[0] as AxisWithVisibleRangeLimit | undefined
  if (!xAxis || !yAxis) return

  if (!clipZoomToData || !dataBounds.hasValidBounds) {
    xAxis.visibleRangeLimit = undefined
    yAxis.visibleRangeLimit = undefined
    return
  }

  xAxis.visibleRangeLimit = new NumberRange(
    dataBounds.xMin - getPaddedLimit(dataBounds.xMin),
    dataBounds.xMax + getPaddedLimit(dataBounds.xMax)
  )
  yAxis.visibleRangeLimit = new NumberRange(
    dataBounds.yMin - getPaddedLimit(dataBounds.yMin),
    dataBounds.yMax + getPaddedLimit(dataBounds.yMax)
  )
}

export interface UseDataSeriesSyncOptions {
  data: ConvertedData
  dataBounds: SciChartDataBounds
  clipZoomToData: boolean
  seriesConfig: SciChartSeriesConfig
  seriesVisibility?: boolean[]
}

export const useDataSeriesSync = ({
  data,
  dataBounds,
  clipZoomToData,
  seriesConfig,
  seriesVisibility,
}: UseDataSeriesSyncOptions) => {
  const initResult = useContext(SciChartSurfaceContext)

  useEffect(() => {
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined
    if (!surface) return

    // Keep runtime sync deterministic: on any series-shape change, rebuild renderable series
    // from current converted data while preserving the existing surface/axes/viewport.
    if (data.series.length === 0) {
      clearRenderableSeries(surface)
      applyVisibleRangeLimits(surface, dataBounds, clipZoomToData)
      surface.invalidateElement()
      return
    }

    clearRenderableSeries(surface)

    const wasmContext = surface.webAssemblyContext2D
    for (let index = 0; index < data.series.length; index += 1) {
      const line = data.series[index]
      const dataSeries = new XyDataSeries(wasmContext, {
        xValues: line.x,
        yValues: line.y,
        isSorted: true,
        containsNaN: false,
        dataSeriesName: line.name,
      })

      const renderableSeries = new FastLineRenderableSeries(wasmContext, {
        dataSeries,
        stroke: toStrokeColor(line, index, seriesConfig),
        strokeThickness: toStrokeThickness(line, seriesConfig),
        strokeDashArray: dashToStrokeArray(line.style.dash),
        resamplingMode: seriesConfig.resamplingMode as EResamplingMode,
        resamplingPrecision: seriesConfig.resamplingPrecision,
        isVisible: toSeriesVisibility(seriesVisibility, index),
      })

      surface.renderableSeries.add(renderableSeries)
    }

    applyVisibleRangeLimits(surface, dataBounds, clipZoomToData)
    surface.invalidateElement()
  }, [initResult, data, dataBounds, clipZoomToData, seriesConfig, seriesVisibility])
}
