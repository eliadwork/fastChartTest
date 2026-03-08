import type { LegendProps } from '../Legend/Legend';

import { useMemo } from 'react';

import { Legend } from '../Legend/Legend';

export type UseChartLegendSlotParams = { show: boolean } & Partial<LegendProps>;

export const useChartLegendSlot = (params: UseChartLegendSlotParams): React.ReactNode => {
  const {
    show,
    backgroundColor,
    textColor,
    seriesVisibility = [],
    seriesGroupKeys,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  } = params;

  return useMemo(() => {
    if (!show) {
      return null;
    }

    return (
      <Legend
        backgroundColor={backgroundColor}
        textColor={textColor}
        seriesVisibility={seriesVisibility}
        seriesGroupKeys={seriesGroupKeys}
        onSeriesVisibilityChange={onSeriesVisibilityChange}
        onSeriesVisibilityGroupChange={onSeriesVisibilityGroupChange}
      />
    );
  }, [
    show,
    backgroundColor,
    textColor,
    seriesVisibility,
    seriesGroupKeys,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  ]);
};
