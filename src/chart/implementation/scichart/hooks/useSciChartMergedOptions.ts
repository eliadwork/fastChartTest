import { useMemo } from 'react'
import type { ChartIcon, ChartOptions, ChartShape } from '../../../types'
import type { ChartImplementationProps } from '../../implementationProps'

/** Internal: merged options with shapes, icons, and visibility handlers for SciChart. */
export type SciChartMergedOptions = ChartOptions & {
  shapes?: ChartShape[]
  icons?: ChartIcon[]
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
      shapes: opts.shapes,
      icons: opts.icons,
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
      opts.shapes,
      opts.icons,
      opts.onSeriesVisibilityChange,
      opts.onSeriesVisibilityGroupChange,
      opts.onDisableAll,
    ]
  )
}
