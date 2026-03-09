import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { withOpacity } from '../../utils/colorUtils';
import type { ChartStyle, ChartStyling } from '../types';
import {
  CHART_BACKGROUND_OPACITY_DEFAULT,
  CHART_FALLBACK_BACKGROUND,
  CHART_FALLBACK_ROLLOVER_STROKE,
  CHART_FALLBACK_TEXT_COLOR,
  CHART_ROLLOVER_DASH_STEPS,
} from '../chartConstants';

export interface UseChartWrapperStyleOptions {
  chartStyle?: ChartStyle;
  styling?: ChartStyling;
}

export const useChartWrapperStyle = ({
  chartStyle,
  styling,
}: UseChartWrapperStyleOptions): ChartStyle => {
  const theme = useTheme();
  return useMemo(() => {
    const defaults: ChartStyle = {
      backgroundColor:
        theme.palette.background.paper != null
          ? withOpacity(theme.palette.background.paper, CHART_BACKGROUND_OPACITY_DEFAULT)
          : CHART_FALLBACK_BACKGROUND,
      rollover: {
        show: true,
        color: CHART_FALLBACK_ROLLOVER_STROKE,
        dash: { isDash: true, steps: [...CHART_ROLLOVER_DASH_STEPS] },
      },
      textColor: theme.palette.text.primary ?? CHART_FALLBACK_TEXT_COLOR,
      zeroLineColor: undefined,
      chartOnly: false,
    };
    if (chartStyle) return chartStyle;
    if (!styling) return defaults;
    const rollover = {
      show: styling.rollover?.show ?? defaults.rollover.show,
      color: styling.rollover?.color ?? defaults.rollover.color,
      dash: styling.rollover?.dash ?? defaults.rollover.dash,
    };
    const defaultChartLineStyles =
      styling.defaultSeriesColors?.length || styling.defaultStrokeThickness != null
        ? {
            color: styling.defaultSeriesColors?.[0],
            thickness: styling.defaultStrokeThickness,
          }
        : undefined;
    return {
      ...defaults,
      chartOnly: styling.chartOnly ?? defaults.chartOnly,
      backgroundColor: styling.backgroundColor ?? defaults.backgroundColor,
      textColor: styling.textColor ?? defaults.textColor,
      zeroLineColor: styling.zeroLineColor ?? defaults.zeroLineColor,
      legendBackgroundColor: styling.legendBackgroundColor,
      defaultChartLineStyles,
      rollover,
    };
  }, [chartStyle, theme, styling]);
};
