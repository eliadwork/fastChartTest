import { useMemo } from 'react';

import {
  CHART_RESAMPLING_PRECISION_DEFAULT,
  CHART_RESAMPLING_PRECISION_OFF,
} from '../chartConstants';
import type {
  ChartImplementationOptions,
  ChartImplementationOptionsWithHandlers,
} from '../implementation/implementationProps';
import type { ChartOptions, ChartShape } from '../types';

export interface UseChartWrapperOptionsParams {
  options: ChartOptions;
  shapes?: ChartShape[];
  icons?: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>;
  seriesVisibility: boolean[];
  handleSeriesVisibilityChange: (seriesIndex: number, isVisible: boolean) => void;
  handleSeriesVisibilityGroupChange: (seriesIndices: number[], isVisible: boolean) => void;
  handleToggleAllSeriesVisibility: () => void;
}

export const useChartWrapperOptions = ({
  options,
  shapes,
  icons,
  seriesVisibility,
  handleSeriesVisibilityChange,
  handleSeriesVisibilityGroupChange,
  handleToggleAllSeriesVisibility,
}: UseChartWrapperOptionsParams): ChartImplementationOptionsWithHandlers => {
  return useMemo(() => {
    const chartOptions = options;

    const resampling: ChartImplementationOptions['resampling'] =
      chartOptions.resampling != null && typeof chartOptions.resampling === 'object'
        ? {
            enable: chartOptions.resampling.enable,
            precision:
              chartOptions.resampling.precision ??
              (chartOptions.resampling.enable
                ? CHART_RESAMPLING_PRECISION_DEFAULT
                : CHART_RESAMPLING_PRECISION_OFF),
          }
        : { enable: false, precision: CHART_RESAMPLING_PRECISION_OFF };

    const stretch: ChartImplementationOptions['stretch'] =
      chartOptions.stretch != null
        ? {
            enable: chartOptions.stretch.enable !== false,
            trigger: (chartOptions.stretch.trigger ??
              'rightClick') as ChartImplementationOptions['stretch']['trigger'],
          }
        : {
            enable: true,
            trigger: 'rightClick' as ChartImplementationOptions['stretch']['trigger'],
          };

    const pan: ChartImplementationOptions['pan'] =
      chartOptions.pan != null
        ? {
            enable: chartOptions.pan.enable !== false,
            trigger: (chartOptions.pan.trigger ??
              'shift') as ChartImplementationOptions['pan']['trigger'],
          }
        : {
            enable: true,
            trigger: 'shift' as ChartImplementationOptions['pan']['trigger'],
          };

    return {
      shapes: shapes ?? [],
      icons: icons ?? [],
      note: chartOptions.note,
      stretch,
      pan,
      resampling,
      clipZoomToData: chartOptions.clipZoomToData !== false,
      seriesVisibility,
      seriesGroupKeys: chartOptions.seriesGroupKeys,
      onSeriesVisibilityChange: handleSeriesVisibilityChange,
      onSeriesVisibilityGroupChange: handleSeriesVisibilityGroupChange,
      onDisableAll: handleToggleAllSeriesVisibility,
      events: chartOptions.events,
    };
  }, [
    options,
    shapes,
    icons,
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleToggleAllSeriesVisibility,
  ]);
};
