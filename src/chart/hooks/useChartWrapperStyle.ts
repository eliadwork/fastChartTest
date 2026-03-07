import { useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { withOpacity } from '../../utils/colorUtils'
import type { ChartStyle } from '../types'
import {
  CHART_BACKGROUND_OPACITY_DEFAULT,
  CHART_FALLBACK_BACKGROUND,
  CHART_FALLBACK_ROLLOVER_STROKE,
  CHART_FALLBACK_TEXT_COLOR,
  CHART_ROLLOVER_DASH_STEPS,
} from '../chartConstants'

export interface UseChartWrapperStyleOptions {
  chartStyle?: ChartStyle
  optionsTextColor?: string
  optionsZeroLineColor?: string
}

export const useChartWrapperStyle = ({
  chartStyle,
  optionsTextColor,
  optionsZeroLineColor,
}: UseChartWrapperStyleOptions): ChartStyle => {
  const theme = useTheme()
  return useMemo(
    () =>
      chartStyle ?? {
        backgroundColor:
          theme.palette.background.paper != null
            ? withOpacity(
                theme.palette.background.paper,
                CHART_BACKGROUND_OPACITY_DEFAULT
              )
            : CHART_FALLBACK_BACKGROUND,
        rollover: {
          show: true,
          color: CHART_FALLBACK_ROLLOVER_STROKE,
          dash: { isDash: true, steps: [...CHART_ROLLOVER_DASH_STEPS] },
        },
        textColor:
          optionsTextColor ?? theme.palette.text.primary ?? CHART_FALLBACK_TEXT_COLOR,
        zeroLineColor: optionsZeroLineColor,
        chartOnly: false,
      },
    [chartStyle, theme, optionsTextColor, optionsZeroLineColor]
  )
}
