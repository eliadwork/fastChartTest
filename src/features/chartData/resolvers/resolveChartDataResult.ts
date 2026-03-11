import type { ChartData, ChartDataSeries } from '../../../chart';
import type { ChartDataWorkerResponse } from '../chartDataContracts';

const FALLBACK_SAMPLE_X = new Float64Array([0, 100_000, 200_000, 300_000, 400_000, 500_000]);
const FALLBACK_SAMPLE_Y = new Float64Array([0, 1000, -500, 2000, -1000, 0]);
const DEFAULT_LINE_STYLE: ChartDataSeries['style'] = { bindable: true };

const resolveLineStyle = (
  style: ChartDataSeries['style'] | undefined
): ChartDataSeries['style'] => style ?? DEFAULT_LINE_STYLE;

export const resolveChartDataWorkerResponse = (
  response: ChartDataWorkerResponse
): ChartData =>
  response.lines.map((line) => ({
    x: new Float64Array(line.x),
    y: new Float64Array(line.y),
    name: line.name,
    lineGroupKey: line.lineGroupKey,
    style: resolveLineStyle(line.style),
  }));

export const resolveFallbackChartData = (): ChartData => [
  {
    x: FALLBACK_SAMPLE_X,
    y: FALLBACK_SAMPLE_Y,
    name: 'Fallback-S0',
    lineGroupKey: 'Fallback',
    style: DEFAULT_LINE_STYLE,
  },
];
