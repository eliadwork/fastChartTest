import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { withOpacity } from '../../utils/colorUtils';
import {
  CHART_BACKGROUND_OPACITY_DEFAULT,
  CHART_FALLBACK_BACKGROUND,
  CHART_FALLBACK_ROLLOVER_STROKE,
  CHART_FALLBACK_TEXT_COLOR,
  CHART_ROLLOVER_DASH_STEPS,
} from '../defaultsChartStyles';
import type { ChartStyle } from '../types';
export interface UseChartWrapperStyleOptions {
  chartStyle?: ChartStyle;
}

export const useChartWrapperStyle = ({ chartStyle }: UseChartWrapperStyleOptions): ChartStyle => {
  const theme = useTheme();
  return useMemo(() => {
    if (chartStyle) return chartStyle;
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
      chartOnly: false,
    };
    return defaults;
  }, [chartStyle, theme]);
};
