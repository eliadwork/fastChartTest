import type { ChartOptions } from './types'
import type { SciChartWrapperOptions, SciChartWrapperOptionsOverrides } from './implementation/scichart/types'

/** Accepts ChartOptions (legacy flat) or SciChartWrapperOptionsOverrides (nested). */
export type ChartOptionsInput = Omit<ChartOptions, 'resampling'> &
  Omit<SciChartWrapperOptionsOverrides, 'resampling'> & {
    resampling?: boolean | SciChartWrapperOptions['resampling']
  }
