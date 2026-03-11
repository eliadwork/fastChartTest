import type { LegendProps } from '../Legend/Legend';
import type { ChartData, ChartStyle, DashConfig } from '../types';

import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';

import { withOpacity } from '../../utils/colorUtils';
import {
  CHART_DEFAULT_SERIES_COLORS,
  CHART_LEGEND_BACKGROUND_OPACITY,
  DEFAULT_LEGEND_BACKGROUND_COLOR,
} from '../defaultsChartStyles';
import { LEGEND_DEFAULT_STROKE, LEGEND_DEFAULT_STROKE_THICKNESS } from '../Legend/legendConstants';

const dashToStrokeDashArray = (dash?: DashConfig): number[] | undefined =>
  dash?.isDash && dash.steps.length > 0 ? dash.steps : undefined;

const buildLegendSeriesModel = (
  chartData: ChartData,
  chartStyle: ChartStyle
): NonNullable<LegendProps['series']> => {
  const defaultSeriesColors = chartStyle.defaults?.seriesColors ?? CHART_DEFAULT_SERIES_COLORS;
  const defaultStrokeThickness =
    chartStyle.defaults?.strokeThickness ?? LEGEND_DEFAULT_STROKE_THICKNESS;

  return chartData.map((line, index) => ({
    index,
    name: line.name,
    stroke:
      line.style.color ??
      defaultSeriesColors[index % defaultSeriesColors.length] ??
      LEGEND_DEFAULT_STROKE,
    strokeDashArray: dashToStrokeDashArray(line.style.dash),
    strokeThickness: line.style.thickness ?? defaultStrokeThickness,
  }));
};

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
    if (chartOnly || chartData.length == 0) {
      return null;
    }

    return {
      backgroundColor: legendBackgroundColor,
      textColor,
      series: buildLegendSeriesModel(chartData, chartStyle),
      seriesVisibility,
      seriesGroupKeys: seriesGroupKeys ?? chartData.map((series) => series.lineGroupKey),
      onSeriesVisibilityChange,
      onSeriesVisibilityGroupChange,
    };
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
