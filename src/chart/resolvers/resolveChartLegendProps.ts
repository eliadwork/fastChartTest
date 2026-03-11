import type { DashConfig, ChartData, ChartStyle } from '../types';

import { CHART_DEFAULT_SERIES_COLORS } from '../defaultsChartStyles';
import { LEGEND_DEFAULT_STROKE, LEGEND_DEFAULT_STROKE_THICKNESS } from '../Legend/legendConstants';
import type { LegendSeriesItemModel } from '../Legend/useLegend';
import {
  resolveLegendProps,
  type ResolvedLegendProps,
  type ResolveLegendPropsParams,
} from './resolveLegendProps';

export type { ResolvedLegendProps } from './resolveLegendProps';

const dashToStrokeDashArray = (dash?: DashConfig): number[] | undefined =>
  dash?.isDash && dash.steps.length > 0 ? dash.steps : undefined;

export interface ResolveChartLegendPropsParams
  extends Pick<
    ResolveLegendPropsParams,
    | 'backgroundColor'
    | 'textColor'
    | 'seriesVisibility'
    | 'onSeriesVisibilityChange'
    | 'onSeriesVisibilityGroupChange'
  > {
  chartData: ChartData;
  chartStyle: ChartStyle;
  seriesGroupKeys?: (string | undefined)[];
}

const buildLegendSeriesModel = (
  chartData: ChartData,
  chartStyle: ChartStyle
): LegendSeriesItemModel[] => {
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

export const resolveChartLegendProps = ({
  chartData,
  chartStyle,
  seriesGroupKeys,
  ...legendProps
}: ResolveChartLegendPropsParams): ResolvedLegendProps =>
  resolveLegendProps({
    ...legendProps,
    series: buildLegendSeriesModel(chartData, chartStyle),
    seriesGroupKeys: seriesGroupKeys ?? chartData.map((series) => series.lineGroupKey),
  });
