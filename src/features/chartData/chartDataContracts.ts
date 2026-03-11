import type { ChartData, ChartDataSeries } from '../../chart';

export interface ChartDataWorkerLine {
  x: ArrayBuffer;
  y: ArrayBuffer;
  name: string;
  lineGroupKey?: string;
  style?: ChartDataSeries['style'];
}

export interface ChartDataWorkerResponse {
  lines: ChartDataWorkerLine[];
}

export interface AddDemoLineInput {
  copyIndex: number;
}

export type ChartDataResult = ChartData;
