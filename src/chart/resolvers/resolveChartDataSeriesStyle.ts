import type { ChartDataSeries } from '../types';

const DEFAULT_CHART_DATA_SERIES_STYLE: ChartDataSeries['style'] = {
  bindable: true,
};

export interface ResolveChartDataSeriesStyleParams {
  style?: ChartDataSeries['style'];
  defaultColor: string;
  defaultThickness: number;
}

export const resolveChartDataSeriesStyle = ({
  style,
  defaultColor,
  defaultThickness,
}: ResolveChartDataSeriesStyleParams): ChartDataSeries['style'] => {
  const resolvedStyle = style ?? DEFAULT_CHART_DATA_SERIES_STYLE;

  return {
    bindable: resolvedStyle.bindable ?? DEFAULT_CHART_DATA_SERIES_STYLE.bindable,
    dash: resolvedStyle.dash,
    color: resolvedStyle.color ?? defaultColor,
    thickness: resolvedStyle.thickness ?? defaultThickness,
  };
};
