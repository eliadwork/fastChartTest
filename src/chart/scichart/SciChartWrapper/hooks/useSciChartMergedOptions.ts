import { useMemo } from 'react'
import type { ChartOptions } from '../../../types'
import type { SciChartWrapperProps } from '../../types'

export interface UseSciChartMergedOptionsParams {
  convertedOptions: ChartOptions
  chartTheme: { defaultSeriesColors: string[]; rolloverStroke?: string; rolloverDash?: { isDash: boolean; steps: number[] }; pointMarkIcon?: string; pointMarkIconColor?: string; pointMarkIconSize?: number }
  opts: NonNullable<SciChartWrapperProps['options']>
  onMiddleClick?: (
    xValue: number,
    yValue: number,
    context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }
  ) => unknown
  chartId?: string
  registerForChart?: (chartId: string, remove: () => void, clear: () => void, removeLast?: () => void) => void
}

export const useSciChartMergedOptions = ({
  convertedOptions,
  chartTheme,
  opts,
  onMiddleClick,
  chartId,
  registerForChart,
}: UseSciChartMergedOptionsParams): ChartOptions => {
  return useMemo(
    () => ({
      ...convertedOptions,
      defaultSeriesColors: chartTheme.defaultSeriesColors,
      rolloverStroke: convertedOptions.rolloverStroke ?? chartTheme.rolloverStroke,
      rolloverDash: convertedOptions.rolloverDash ?? chartTheme.rolloverDash,
      pointMarkIcon: chartTheme.pointMarkIcon,
      pointMarkIconColor: chartTheme.pointMarkIconColor,
      pointMarkIconSize: chartTheme.pointMarkIconSize,
      onSeriesVisibilityChange: opts.onSeriesVisibilityChange,
      onSeriesVisibilityGroupChange: opts.onSeriesVisibilityGroupChange,
      onDisableAll: opts.onDisableAll,
      onPointMark: onMiddleClick
        ? (xValue: number, yValue: number, context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }) =>
            onMiddleClick(xValue, yValue, context) as
              | import('../../../types').ChartLineShape
              | import('../../../types').ChartMarkerShape
              | (import('../../../types').ChartLineShape | import('../../../types').ChartMarkerShape)[]
              | null
        : undefined,
      ...(chartId && registerForChart
        ? {
            pointMarkRegisterForClear: (
              chartIdParam: string,
              remove: () => void,
              clear: () => void,
              removeLast?: () => void
            ) => registerForChart(chartIdParam, remove, clear, removeLast),
          }
        : {}),
    }),
    [
      convertedOptions,
      chartTheme,
      opts.onSeriesVisibilityChange,
      opts.onSeriesVisibilityGroupChange,
      opts.onDisableAll,
      onMiddleClick,
      chartId,
      registerForChart,
    ]
  )
}
