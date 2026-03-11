import { useMemo } from 'react';

import type { ChartImplementationOptionsWithHandlers } from '../chartImplementationContracts';
import {
  resolveChartImplementationOptions,
  type ResolvedChartOptions,
} from '../resolvers/resolveChartOptions';
import type { ChartData, ChartIcon, ChartShape } from '../types';

export interface UseChartWrapperOptionsParams {
  data: ChartData;
  options: ResolvedChartOptions;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  seriesVisibility: boolean[];
  handleSeriesVisibilityChange: (seriesIndex: number, isVisible: boolean) => void;
  handleSeriesVisibilityGroupChange: (seriesIndices: number[], isVisible: boolean) => void;
  handleToggleAllSeriesVisibility: () => void;
}

export const useChartWrapperOptions = ({
  data,
  options,
  shapes,
  icons,
  seriesVisibility,
  handleSeriesVisibilityChange,
  handleSeriesVisibilityGroupChange,
  handleToggleAllSeriesVisibility,
}: UseChartWrapperOptionsParams): ChartImplementationOptionsWithHandlers => {
  return useMemo(
    () =>
      resolveChartImplementationOptions({
        data,
        options,
        shapes,
        icons,
        seriesVisibility,
        handleSeriesVisibilityChange,
        handleSeriesVisibilityGroupChange,
        handleToggleAllSeriesVisibility,
      }),
    [
      data,
      options,
      shapes,
      icons,
      seriesVisibility,
      handleSeriesVisibilityChange,
      handleSeriesVisibilityGroupChange,
      handleToggleAllSeriesVisibility,
    ]
  );
};
