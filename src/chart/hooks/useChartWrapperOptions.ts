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
  handleSeriesVisibilityChange: (index: number, visible: boolean) => void;
  handleSeriesVisibilityGroupChange: (indices: number[], visible: boolean) => void;
  handleDisableAll: () => void;
}

export const useChartWrapperOptions = ({
  options,
  shapes,
  icons,
  seriesVisibility,
  handleSeriesVisibilityChange,
  handleSeriesVisibilityGroupChange,
  handleDisableAll,
}: UseChartWrapperOptionsParams): ChartImplementationOptionsWithHandlers => {
  return useMemo(() => {
    const opts = options;
    const resamplingObj: ChartImplementationOptions['resampling'] =
      opts.resampling != null && typeof opts.resampling === 'object'
        ? {
            enable: opts.resampling.enable,
            precision:
              opts.resampling.precision ??
              (opts.resampling.enable ? CHART_RESAMPLING_PRECISION_DEFAULT : CHART_RESAMPLING_PRECISION_OFF),
          }
        : { enable: false, precision: CHART_RESAMPLING_PRECISION_OFF };

    const stretch: ChartImplementationOptions['stretch'] =
      opts.stretch != null
        ? {
            enable: opts.stretch.enable !== false,
            trigger: (opts.stretch.trigger ?? 'rightClick') as ChartImplementationOptions['stretch']['trigger'],
          }
        : { enable: true, trigger: 'rightClick' as ChartImplementationOptions['stretch']['trigger'] };

    const pan: ChartImplementationOptions['pan'] =
      opts.pan != null
        ? {
            enable: opts.pan.enable !== false,
            trigger: (opts.pan.trigger ?? 'shift') as ChartImplementationOptions['pan']['trigger'],
          }
        : { enable: true, trigger: 'shift' as ChartImplementationOptions['pan']['trigger'] };

    return {
      shapes: shapes ?? [],
      icons: icons ?? [],
      note: opts.note,
      stretch,
      pan,
      resampling: resamplingObj,
      clipZoomToData: opts.clipZoomToData !== false,
      seriesVisibility,
      seriesGroupKeys: opts.seriesGroupKeys,
      onSeriesVisibilityChange: handleSeriesVisibilityChange,
      onSeriesVisibilityGroupChange: handleSeriesVisibilityGroupChange,
      onDisableAll: handleDisableAll,
      events: opts.events,
    };
  }, [
    options,
    shapes,
    icons,
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleDisableAll,
  ]);
};
