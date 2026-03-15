import type { ChartData, ChartIcon, ChartOptions, ChartShape, ChartStyle } from '../types';

import { useMemo } from 'react';
import { useChartHeaderState } from './useChartHeaderState';
import { useChartLegendProps } from './useChartLegendProps';
import {
  resolveChartDefinition,
  resolveChartData,
  resolveChartOptions,
  type ResolvedChartOptions,
} from '../resolvers/resolveChartOptions';
import { useChartVisibility } from './useChartVisibility';
import { useChartZoomCallbacks } from './useChartZoomCallbacks';
import { useChartWrapperStyle } from './useDefaultChartStyle';

export interface UseChartParams {
  data: ChartData | null;
  chartId?: string;
  title?: string;
  options?: ChartOptions;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  chartStyle?: ChartStyle;
  defaultLineColor?: string;
  onSeriesVisibilityChange?: (visibility: boolean[]) => void;
}

export interface ChartHeaderModel {
  showHeader: boolean;
  headerSx: Record<string, unknown>;
  textColor: string;
  title?: string;
  note?: string;
}

export interface ChartToolbarModel {
  zoomBackRef: React.MutableRefObject<(() => void) | null>;
  zoomResetRef: React.MutableRefObject<(() => void) | null>;
  canZoomBack: boolean;
  showToolbar: boolean;
  allSeriesHidden: boolean;
  handleToggleAllSeriesVisibility: () => void;
}

export interface ChartImplementationModel {
  chartId?: string;
  definition: ReturnType<typeof resolveChartDefinition>;
}

export interface UseChartResult {
  loading: boolean;
  options: ResolvedChartOptions;
  legendProps: ReturnType<typeof useChartLegendProps>;
  headerModel: ChartHeaderModel;
  toolbarModel: ChartToolbarModel;
  implementationModel: ChartImplementationModel;
}

export const useChart = ({
  data,
  chartId,
  title,
  options,
  shapes,
  icons,
  chartStyle,
  defaultLineColor,
  onSeriesVisibilityChange,
}: UseChartParams): UseChartResult => {
  const resolvedOptions = resolveChartOptions(options);
  const legendEnabled = resolvedOptions.features.legend.enabled;
  const toolbarEnabled = resolvedOptions.features.toolbar.enabled;
  const loading = data == null;
  const wrapperStyle = useChartWrapperStyle({ chartStyle });
  const chartData = resolveChartData(data, wrapperStyle, defaultLineColor);

  const { zoomCallbacks, zoomBackRef, zoomResetRef, canZoomBack } = useChartZoomCallbacks();

  const {
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleToggleAllSeriesVisibility,
    allSeriesHidden,
  } = useChartVisibility({
    seriesCount: chartData.length,
    initialVisibility: resolvedOptions.seriesVisibility,
    onSeriesVisibilityChange,
  });

  const definition = useMemo(
    () =>
      resolveChartDefinition({
        data: chartData,
        options: resolvedOptions,
        style: wrapperStyle,
        shapes,
        icons,
        seriesVisibility,
      }),
    [chartData, resolvedOptions, wrapperStyle, shapes, icons, seriesVisibility]
  );
  const definitionWithZoomCallbacks = useMemo(
    () => ({
      ...definition,
      options: {
        ...definition.options,
        events: definition.options.events
          ? { ...definition.options.events, zoom: zoomCallbacks }
          : { zoom: zoomCallbacks },
      },
    }),
    [definition, zoomCallbacks]
  );

  const textColor = wrapperStyle.textColor;

  const legendProps = useChartLegendProps({
    chartData,
    chartStyle: wrapperStyle,
    seriesVisibility,
    seriesGroupKeys: resolvedOptions.seriesGroupKeys,
    textColor,
    chartOnly: wrapperStyle.chartOnly || !legendEnabled,
    onSeriesVisibilityChange: handleSeriesVisibilityChange,
    onSeriesVisibilityGroupChange: handleSeriesVisibilityGroupChange,
  });

  const { showHeader, headerSx } = useChartHeaderState({
    title,
    note: resolvedOptions.note,
    textColor,
    chartOnly: wrapperStyle.chartOnly,
    loading,
  });

  return {
    loading,
    options: resolvedOptions,
    legendProps,
    headerModel: {
      showHeader,
      headerSx,
      textColor,
      title,
      note: resolvedOptions.note,
    },
    toolbarModel: {
      zoomBackRef,
      zoomResetRef,
      canZoomBack,
      showToolbar: toolbarEnabled,
      allSeriesHidden,
      handleToggleAllSeriesVisibility,
    },
    implementationModel: {
      chartId,
      definition: definitionWithZoomCallbacks,
    },
  };
};
