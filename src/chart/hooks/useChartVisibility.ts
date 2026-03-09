import { useEffect } from 'react';

import { useChartSeriesVisibility } from './useChartSeriesVisibility';

export interface UseChartVisibilityOptions {
  seriesCount: number;
  initialVisibility?: boolean[];
  onSeriesVisibilityChange?: (visibility: boolean[]) => void;
}

export const useChartVisibility = ({
  seriesCount,
  initialVisibility,
  onSeriesVisibilityChange,
}: UseChartVisibilityOptions) => {
  const {
    seriesVisibility,
    handleDisableAll,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    allSeriesHidden,
  } = useChartSeriesVisibility({
    initialSeriesCount: seriesCount,
    initialVisibility,
  });

  useEffect(() => {
    onSeriesVisibilityChange?.(seriesVisibility);
  }, [seriesVisibility, onSeriesVisibilityChange]);

  return {
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleToggleAllSeriesVisibility: handleDisableAll,
    allSeriesHidden,
  };
};
