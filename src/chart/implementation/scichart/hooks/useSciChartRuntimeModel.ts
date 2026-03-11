import type { ChartZoomCallbacks } from '../../implementationProps';
import type { ConvertedData } from '../convert';
import type { SciChartMergedOptions } from './useSciChartMergedOptions';

import { useSciChartDataBounds } from './useSciChartDataBounds';
import { useSciChartInitChart } from './useSciChartInitChart';
import { useSciChartInteractionConfig } from './useSciChartInteractionConfig';
import { useSciChartSeriesConfig } from './useSciChartSeriesConfig';
import { useSciChartShapesModel } from './useSciChartShapesModel';

export interface UseSciChartRuntimeModelOptions {
  data: ConvertedData;
  options: SciChartMergedOptions;
  zoomCallbacks?: ChartZoomCallbacks;
}

export const useSciChartRuntimeModel = ({
  data,
  options,
  zoomCallbacks,
}: UseSciChartRuntimeModelOptions) => {
  const { lines: lineShapes, boxes } = useSciChartShapesModel(options.shapes);
  const dataBounds = useSciChartDataBounds(data);
  const seriesConfig = useSciChartSeriesConfig(options);
  const interactionConfig = useSciChartInteractionConfig(options);

  const initChart = useSciChartInitChart({
    data,
    options,
    zoomCallbacks,
    dataBounds,
    seriesConfig,
    interactionConfig,
  });

  return {
    initChart,
    lineShapes,
    boxes,
    dataBounds,
    seriesConfig,
  };
};
