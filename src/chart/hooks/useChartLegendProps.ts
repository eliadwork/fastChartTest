import type { LegendProps } from '../Legend/Legend';
import type { ChartData } from '../types';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

import { withOpacity } from '../../utils/colorUtils';
import { CHART_LEGEND_BACKGROUND_OPACITY } from '../chartConstants';
import { DEFAULT_LEGEND_BACKGROUND_COLOR } from '../defaults';

export interface UseChartLegendPropsOptions {
  chartData: ChartData;
  data: ChartData | null;
  seriesVisibility: boolean[];
  seriesGroupKeys?: (string | undefined)[];
  textColor?: string;
  chartOnly: boolean;
  onSeriesVisibilityChange: (seriesIndex: number, isVisible: boolean) => void;
  onSeriesVisibilityGroupChange: (seriesIndices: number[], isVisible: boolean) => void;
}

export const useChartLegendProps = ({
  chartData,
  data,
  seriesVisibility,
  seriesGroupKeys,
  textColor,
  chartOnly,
  onSeriesVisibilityChange,
  onSeriesVisibilityGroupChange,
}: UseChartLegendPropsOptions): LegendProps | null => {
  const theme = useTheme();

  const legendBackgroundColor = useMemo(() => {
    const backgroundColor = theme.palette.background.paper;
    if (backgroundColor == null) {
      return DEFAULT_LEGEND_BACKGROUND_COLOR;
    }

    return withOpacity(backgroundColor, CHART_LEGEND_BACKGROUND_OPACITY);
  }, [theme.palette.background.paper]);

  return useMemo(() => {
    if (chartOnly || data == null) {
      return null;
    }

    return {
      backgroundColor: legendBackgroundColor,
      textColor,
      seriesVisibility,
      seriesGroupKeys: seriesGroupKeys ?? chartData.map((series) => series.lineGroupKey),
      onSeriesVisibilityChange,
      onSeriesVisibilityGroupChange,
    };
  }, [
    chartOnly,
    data,
    legendBackgroundColor,
    textColor,
    seriesVisibility,
    seriesGroupKeys,
    chartData,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  ]);
};
