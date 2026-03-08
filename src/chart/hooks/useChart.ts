import type { ChartData, ChartIcon, ChartOptions, ChartShape, ChartStyle } from '../types';

import { useEffect } from 'react';

import { useChartHeaderState } from './useChartHeaderState';
import { useChartLegendProps } from './useChartLegendProps';
import { useChartSeriesVisibility } from './useChartSeriesVisibility';
import { useChartWrapperOptions } from './useChartWrapperOptions';
import { useChartWrapperStyle } from './useChartWrapperStyle';
import { useChartZoomCallbacks } from './useChartZoomCallbacks';

const EMPTY_CHART_DATA: ChartData = [];

export interface UseChartParams {
  data: ChartData | null;
  chartId?: string;
  title?: string;
  options?: ChartOptions;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  chartStyle?: ChartStyle;
  /** Called when series visibility changes (e.g. from legend). Used by Detect for modal. */
  onSeriesVisibilityChange?: (visibility: boolean[]) => void;
}

export const useChart = ({
  data,
  chartId,
  title,
  options = {},
  shapes,
  icons,
  chartStyle,
  onSeriesVisibilityChange,
}: UseChartParams) => {
  const chartData = data ?? EMPTY_CHART_DATA;
  const loading = data == null;

  const {
    zoomCallbacks,
    zoomBackRef,
    zoomResetRef,
    canZoomBack,
  } = useChartZoomCallbacks();

  const {
    seriesVisibility,
    handleDisableAll,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    allSeriesHidden,
  } = useChartSeriesVisibility({
    initialSeriesCount: chartData.length,
    initialVisibility: options.seriesVisibility,
  });

  useEffect(() => {
    onSeriesVisibilityChange?.(seriesVisibility);
  }, [seriesVisibility, onSeriesVisibilityChange]);

  const wrapperStyle = useChartWrapperStyle({
    chartStyle,
    optionsTextColor: options.textColor,
    optionsZeroLineColor: options.zeroLineColor,
  });

  const wrapperOptions = useChartWrapperOptions({
    options,
    shapes,
    icons,
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleDisableAll,
  });

  const textColor = wrapperStyle.textColor;

  const legendProps = useChartLegendProps({
    chartData,
    data,
    seriesVisibility,
    seriesGroupKeys: options.seriesGroupKeys,
    textColor,
    chartOnly: wrapperStyle.chartOnly,
    onSeriesVisibilityChange: handleSeriesVisibilityChange,
    onSeriesVisibilityGroupChange: handleSeriesVisibilityGroupChange,
  });

  const { showHeader, headerSx } = useChartHeaderState({
    title,
    note: options.note,
    textColor,
    chartOnly: wrapperStyle.chartOnly,
    loading,
  });

  return {
    chartData,
    chartId,
    wrapperStyle,
    wrapperOptions,
    zoomCallbacks,
    textColor,
    showHeader,
    headerSx,
    options,
    legendProps,
    zoomBackRef,
    zoomResetRef,
    canZoomBack,
    handleDisableAll,
    allSeriesHidden,
    loading,
  };
};
