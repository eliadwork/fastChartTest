import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { resolveChartStyle } from '../resolvers/resolveChartStyle';
import type { ChartStyle } from '../types';
export interface UseChartWrapperStyleOptions {
  chartStyle?: ChartStyle;
}

export const useChartWrapperStyle = ({ chartStyle }: UseChartWrapperStyleOptions): ChartStyle => {
  const theme = useTheme();
  return useMemo(
    () =>
      resolveChartStyle({
        chartStyle,
        themeBackgroundColor: theme.palette.background.paper,
        themeTextColor: theme.palette.text.primary,
      }),
    [chartStyle, theme.palette.background.paper, theme.palette.text.primary]
  );
};
