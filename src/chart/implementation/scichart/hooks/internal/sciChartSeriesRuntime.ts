import { FastLineRenderableSeries, SciChartSurface, XyDataSeries } from 'scichart';

import { dashToStrokeArray } from '../../convert';
import type {
  ResolvedSciChartData,
  ResolvedSciChartDataSeries,
  ResolvedSciChartResamplingOption,
} from '../../scichartOptions';

interface SciChartSeriesLike {
  dataSeries?: { delete?: () => void };
  delete?: () => void;
}

const toStrokeColor = (line: ResolvedSciChartDataSeries) => line.style.color;
const toStrokeThickness = (line: ResolvedSciChartDataSeries) => line.style.thickness;

const disposeRenderableSeries = (series: SciChartSeriesLike) => {
  series.dataSeries?.delete?.();
  series.delete?.();
};

export const clearRenderableSeries = (surface: SciChartSurface) => {
  const previousSeries = surface.renderableSeries.asArray() as SciChartSeriesLike[];
  for (const series of previousSeries) {
    disposeRenderableSeries(series);
  }
  surface.renderableSeries.clear();
};

export interface RebuildRenderableSeriesOptions {
  surface: SciChartSurface;
  data: ResolvedSciChartData;
  seriesConfig: ResolvedSciChartResamplingOption;
}

export const rebuildRenderableSeries = ({
  surface,
  data,
  seriesConfig,
}: RebuildRenderableSeriesOptions) => {
  clearRenderableSeries(surface);

  const wasmContext = surface.webAssemblyContext2D;
  for (let index = 0; index < data.series.length; index += 1) {
    const line = data.series[index];
    const dataSeries = new XyDataSeries(wasmContext, {
      xValues: line.x,
      yValues: line.y,
      isSorted: true,
      containsNaN: false,
      dataSeriesName: line.name,
    });

    const renderableSeries = new FastLineRenderableSeries(wasmContext, {
      dataSeries,
      stroke: toStrokeColor(line),
      strokeThickness: toStrokeThickness(line),
      strokeDashArray: dashToStrokeArray(line.style.dash),
      resamplingMode: seriesConfig.resamplingMode,
      resamplingPrecision: seriesConfig.resamplingPrecision,
      isVisible: data.seriesVisibility[index],
    });

    surface.renderableSeries.add(renderableSeries);
  }
};
