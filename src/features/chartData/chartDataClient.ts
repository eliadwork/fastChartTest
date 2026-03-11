import type { ChartData, ChartDataSeries } from '../../chart';
import type { AddDemoLineInput, ChartDataResult, ChartDataWorkerResponse } from './chartDataContracts';
import { resolveChartDataSourceMode } from './chartDataSourceMode';
import {
  resolveChartDataWorkerResponse,
  resolveFallbackChartData,
} from './resolvers/resolveChartDataResult';

export const fetchChartData = async (): Promise<ChartDataResult> =>
  new Promise((resolve) => {
    const sourceMode = resolveChartDataSourceMode();
    if (sourceMode !== 'worker') {
      resolve(resolveFallbackChartData());
      return;
    }

    const worker = new Worker(new URL('../../dataWorker.js', import.meta.url), {
      type: 'module',
    });

    const cleanup = () => {
      worker.onmessage = null;
      worker.onerror = null;
      worker.terminate();
    };

    worker.onerror = (errorEvent) => {
      console.error(
        '[dataWorker] Error:',
        errorEvent.message,
        errorEvent.filename,
        errorEvent.lineno
      );
      cleanup();
      resolve(resolveFallbackChartData());
    };

    worker.onmessage = ({ data }: MessageEvent<ChartDataWorkerResponse>) => {
      if (!data?.lines?.length) {
        console.warn('[dataWorker] Received empty lines');
        cleanup();
        resolve(resolveFallbackChartData());
        return;
      }

      cleanup();
      resolve(resolveChartDataWorkerResponse(data));
    };

    worker.postMessage({});
  });

export const addDemoLineToChartData = (
  chartData: ChartData,
  { copyIndex }: AddDemoLineInput
): ChartData => {
  if (chartData.length === 0) {
    return chartData;
  }

  const sourceLine = chartData[0];
  if (sourceLine == null) {
    return chartData;
  }

  const yOffset = copyIndex * 500;
  const copiedY = Array.from(sourceLine.y, (value) => value + yOffset);

  const copiedLine: ChartDataSeries = {
    ...sourceLine,
    name: `Demo-Copy-${copyIndex}`,
    lineGroupKey: `Demo-Copy-${copyIndex}`,
    y: copiedY,
  };

  return [...chartData, copiedLine];
};
