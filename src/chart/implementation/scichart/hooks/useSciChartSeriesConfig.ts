import type { scichartFullDefinition } from '../scichartOptions'

import { useMemo } from 'react'

import {
  SCI_CHART_DEFAULT_SERIES_COLORS,
  SCI_CHART_DEFAULT_STROKE_THICKNESS,
} from '../sciChartWrapperConstants'

export interface SciChartSeriesConfig {
  seriesColors: string[]
  strokeThickness: number
  resamplingMode: scichartFullDefinition['options']['resampling']['resamplingMode']
  resamplingPrecision: number
}

export const useSciChartSeriesConfig = (
  definition: scichartFullDefinition
): SciChartSeriesConfig => {
  const seriesColors = useMemo(
    () => definition.styles.defaultStyles.seriesColors ?? [...SCI_CHART_DEFAULT_SERIES_COLORS],
    [definition.styles.defaultStyles.seriesColors]
  )

  const strokeThickness =
    definition.styles.defaultStyles.strokeThickness ?? SCI_CHART_DEFAULT_STROKE_THICKNESS

  return {
    seriesColors,
    strokeThickness,
    resamplingMode: definition.options.resampling.resamplingMode,
    resamplingPrecision: definition.options.resampling.resamplingPrecision,
  }
}
