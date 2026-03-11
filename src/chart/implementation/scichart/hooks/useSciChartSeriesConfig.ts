import type { SciChartMergedOptions } from './useSciChartMergedOptions'

import { EResamplingMode } from 'scichart'

export interface SciChartSeriesConfig {
  resamplingMode: EResamplingMode
  resamplingPrecision: number
}

export const useSciChartSeriesConfig = (
  options: SciChartMergedOptions
): SciChartSeriesConfig => {
  const resamplingEnabled = options.resampling.enable
  const resamplingMode = resamplingEnabled
    ? EResamplingMode.Auto
    : EResamplingMode.None
  const resamplingPrecision = options.resampling.precision

  return {
    resamplingMode,
    resamplingPrecision,
  }
}
