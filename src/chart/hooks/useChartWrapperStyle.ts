import { useMemo } from 'react'
import { withOpacity } from '../../chartTheme'
import type { ChartStyle } from '../types'
import type { ChartTheme } from '../../chartTheme'
import {
  CHART_BACKGROUND_OPACITY_DEFAULT,
  CHART_FALLBACK_BACKGROUND,
  CHART_FALLBACK_ROLLOVER_STROKE,
  CHART_FALLBACK_TEXT_COLOR,
  CHART_ROLLOVER_DASH_STEPS,
} from '../chartConstants'

export interface UseChartWrapperStyleOptions {
  chartTheme: ChartTheme
  chartStyle?: ChartStyle
  optionsTextColor?: string
  optionsZeroLineColor?: string
}

export const useChartWrapperStyle = ({
  chartTheme,
  chartStyle,
  optionsTextColor,
  optionsZeroLineColor,
}: UseChartWrapperStyleOptions): ChartStyle => {
  return useMemo(
    () =>
      chartStyle ?? {
        backgroundColor:
          chartTheme.backgroundColor != null
            ? withOpacity(chartTheme.backgroundColor, chartTheme.chartBackgroundOpacity ?? CHART_BACKGROUND_OPACITY_DEFAULT)
            : (chartTheme.backgroundColor ?? CHART_FALLBACK_BACKGROUND),
        rollover: {
          show: true,
          color: chartTheme.rolloverStroke ?? CHART_FALLBACK_ROLLOVER_STROKE,
          dash: chartTheme.rolloverDash ?? { isDash: true, steps: [...CHART_ROLLOVER_DASH_STEPS] },
        },
        textColor: chartTheme.textColor ?? optionsTextColor ?? CHART_FALLBACK_TEXT_COLOR,
        zeroLineColor: chartTheme.zeroLineColor ?? optionsZeroLineColor,
        chartOnly: false,
      },
    [chartStyle, chartTheme, optionsTextColor, optionsZeroLineColor]
  )
}
