import type { SciChartMergedOptions } from './useSciChartMergedOptions'

import { useMemo } from 'react'
import { EResamplingMode } from 'scichart'

import {
  SCI_CHART_DEFAULT_SERIES_COLORS,
  SCI_CHART_DEFAULT_STROKE_THICKNESS,
  SCI_CHART_RESAMPLING_PRECISION_DEFAULT,
  SCI_CHART_RESAMPLING_PRECISION_OFF,
} from '../sciChartWrapperConstants'

export interface SciChartSeriesConfig {
  seriesColors: string[]
  strokeThickness: number
  resamplingMode: EResamplingMode
  resamplingPrecision: number
}

export const useSciChartSeriesConfig = (
  options: SciChartMergedOptions
): SciChartSeriesConfig => {
  const seriesColors = useMemo(
    () => options.defaultSeriesColors ?? [...SCI_CHART_DEFAULT_SERIES_COLORS],
    [options.defaultSeriesColors]
  )

  const strokeThickness =
    options.defaultStrokeThickness ?? SCI_CHART_DEFAULT_STROKE_THICKNESS

  const resamplingEnabled = options.resampling?.enable !== false
  const resamplingMode = resamplingEnabled
    ? EResamplingMode.Auto
    : EResamplingMode.None
  const resamplingPrecision =
    options.resampling?.precision ??
    (resamplingEnabled
      ? SCI_CHART_RESAMPLING_PRECISION_DEFAULT
      : SCI_CHART_RESAMPLING_PRECISION_OFF)

  return {
    seriesColors,
    strokeThickness,
    resamplingMode,
    resamplingPrecision,
  }
}
