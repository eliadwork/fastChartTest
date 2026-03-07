import { useMemo } from 'react';
import { CHART_RESAMPLING_PRECISION_DEFAULT } from '../chartConstants';
import type {
  ChartImplementationOptions,
  ChartImplementationOptionsWithHandlers,
} from '../implementation/implementationProps';
import type { ChartOptions } from '../types';

export interface UseChartWrapperOptionsParams {
  options: ChartOptions;
  icons?: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>;
  seriesVisibility: boolean[];
  handleSeriesVisibilityChange: (index: number, visible: boolean) => void;
  handleSeriesVisibilityGroupChange: (indices: number[], visible: boolean) => void;
  handleDisableAll: () => void;
}

export const useChartWrapperOptions = ({
  options,
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
            precision: opts.resampling.precision ?? CHART_RESAMPLING_PRECISION_DEFAULT,
          }
        : {
            enable: opts.resampling !== false,
            precision: CHART_RESAMPLING_PRECISION_DEFAULT,
          };
    return {
      shapes: opts.shapes,
      icons: icons ?? opts.icons,
      note: opts.note,
      stretch: opts.stretch ?? {
        enable: true,
        trigger: 'rightClick' as ChartImplementationOptions['stretch']['trigger'],
      },
      pan: opts.pan ?? {
        enable: true,
        trigger: 'shift' as ChartImplementationOptions['pan']['trigger'],
      },
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
    icons,
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleDisableAll,
  ]);
};
