import { resolveChartDataSourceMode } from './chartDataSourceMode';

const chartDataSourceMode = resolveChartDataSourceMode();

export const chartDataQueryKey = ['chart-data', chartDataSourceMode] as const;
