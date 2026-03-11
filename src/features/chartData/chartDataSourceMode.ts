export const CHART_DATA_SOURCE_MODE = {
  worker: 'worker',
  api: 'api',
} as const;

export type ChartDataSourceMode =
  (typeof CHART_DATA_SOURCE_MODE)[keyof typeof CHART_DATA_SOURCE_MODE];

export const DEFAULT_CHART_DATA_SOURCE_MODE: ChartDataSourceMode = CHART_DATA_SOURCE_MODE.worker;

export const resolveChartDataSourceMode = (
  sourceMode?: ChartDataSourceMode
): ChartDataSourceMode => sourceMode ?? DEFAULT_CHART_DATA_SOURCE_MODE;
