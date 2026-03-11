import type { ChartData, ChartStyle } from '../types';

import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';

import { withOpacity } from '../../utils/colorUtils';
import {
  CHART_LEGEND_BACKGROUND_OPACITY,
  DEFAULT_LEGEND_BACKGROUND_COLOR,
} from '../defaultsChartStyles';
import {
  resolveChartLegendProps,
  type ResolvedLegendProps,
} from '../resolvers/resolveChartLegendProps';

export interface UseChartLegendPropsOptions {
  chartData: ChartData;
  chartStyle: ChartStyle;
  seriesVisibility: boolean[];
  seriesGroupKeys?: (string | undefined)[];
  textColor?: string;
  chartOnly: boolean;
  onSeriesVisibilityChange: (seriesIndex: number, isVisible: boolean) => void;
  onSeriesVisibilityGroupChange: (seriesIndices: number[], isVisible: boolean) => void;
}

export const useChartLegendProps = ({
  chartData,
  chartStyle,
  seriesVisibility,
  seriesGroupKeys,
  textColor,
  chartOnly,
  onSeriesVisibilityChange,
  onSeriesVisibilityGroupChange,
}: UseChartLegendPropsOptions): ResolvedLegendProps | null => {
  const theme = useTheme();

  const legendBackgroundColor = useMemo(() => {
    const backgroundColor = theme.palette.background.paper;
    if (backgroundColor == null) {
      return DEFAULT_LEGEND_BACKGROUND_COLOR;
    }

    return withOpacity(backgroundColor, CHART_LEGEND_BACKGROUND_OPACITY);
  }, [theme.palette.background.paper]);

  return useMemo(() => {
    if (chartOnly || chartData.length == 0) {
      return null;
    }

    return resolveChartLegendProps({
      chartData,
      chartStyle,
      backgroundColor: legendBackgroundColor,
      textColor,
      seriesVisibility,
      seriesGroupKeys,
      onSeriesVisibilityChange,
      onSeriesVisibilityGroupChange,
    });
  }, [
    chartOnly,
    chartStyle,
    legendBackgroundColor,
    textColor,
    seriesVisibility,
    seriesGroupKeys,
    chartData,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  ]);
};
