import { useMemo } from 'react'
import type { ChartOptions } from '../../../types'
import type { ChartImplementationProps } from '../../implementationProps'

/** Internal: merged options with visibility handlers for Legend. */
export type SciChartMergedOptions = ChartOptions & {
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
  onDisableAll?: () => void
}

export interface UseSciChartMergedOptionsParams {
  convertedOptions: ChartOptions
  chartTheme: { defaultSeriesColors: string[]; rolloverStroke?: string; rolloverDash?: { isDash: boolean; steps: number[] } }
  opts: NonNullable<ChartImplementationProps['options']>
}

export const useSciChartMergedOptions = ({
  convertedOptions,
  chartTheme,
  opts,
}: UseSciChartMergedOptionsParams): SciChartMergedOptions => {
  return useMemo(
    () => ({
      ...convertedOptions,
      defaultSeriesColors: chartTheme.defaultSeriesColors,
      rolloverStroke: convertedOptions.rolloverStroke ?? chartTheme.rolloverStroke,
      rolloverDash: convertedOptions.rolloverDash ?? chartTheme.rolloverDash,
      onSeriesVisibilityChange: opts.onSeriesVisibilityChange,
      onSeriesVisibilityGroupChange: opts.onSeriesVisibilityGroupChange,
      onDisableAll: opts.onDisableAll,
    }),
    [
      convertedOptions,
      chartTheme,
      opts.onSeriesVisibilityChange,
      opts.onSeriesVisibilityGroupChange,
      opts.onDisableAll,
    ]
  )
}
