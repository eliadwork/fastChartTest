import type {
  ChartData,
  ChartIcon,
  ChartOptions,
  ChartShape,
  ChartStyle,
} from '../types';

import { useChartHeaderState } from './useChartHeaderState';
import { useChartLegendProps } from './useChartLegendProps';
import { useChartVisibility } from './useChartVisibility';
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
  allSeriesHidden: boolean;
  handleToggleAllSeriesVisibility: () => void;
}

export interface ChartImplementationModel {
  chartId?: string;
  chartData: ChartData;
  wrapperStyle: ChartStyle;
  wrapperOptions: ReturnType<typeof useChartWrapperOptions>;
  zoomCallbacks: ReturnType<typeof useChartZoomCallbacks>['zoomCallbacks'];
}

export interface UseChartResult {
  loading: boolean;
  options: ChartOptions;
  legendProps: ReturnType<typeof useChartLegendProps>;
  headerModel: ChartHeaderModel;
  toolbarModel: ChartToolbarModel;
  implementationModel: ChartImplementationModel;
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
}: UseChartParams): UseChartResult => {
  const chartData = data ?? EMPTY_CHART_DATA;
  const loading = data == null;

  const { zoomCallbacks, zoomBackRef, zoomResetRef, canZoomBack } = useChartZoomCallbacks();

  const {
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleToggleAllSeriesVisibility,
    allSeriesHidden,
  } = useChartVisibility({
    seriesCount: chartData.length,
    initialVisibility: options.seriesVisibility,
    onSeriesVisibilityChange,
  });

  const wrapperStyle = useChartWrapperStyle({
    chartStyle,
    styling: options.styling,
  });

  const wrapperOptions = useChartWrapperOptions({
    options,
    shapes,
    icons,
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleToggleAllSeriesVisibility,
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
    loading,
    options,
    legendProps,
    headerModel: {
      showHeader,
      headerSx,
      textColor,
      title,
      note: options.note,
    },
    toolbarModel: {
      zoomBackRef,
      zoomResetRef,
      canZoomBack,
      allSeriesHidden,
      handleToggleAllSeriesVisibility,
    },
    implementationModel: {
      chartId,
      chartData,
      wrapperStyle,
      wrapperOptions,
      zoomCallbacks,
    },
  };
};
