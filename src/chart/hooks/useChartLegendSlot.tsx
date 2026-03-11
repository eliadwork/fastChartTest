import type { LegendProps } from '../Legend/Legend';

import { useMemo } from 'react';

import { Legend } from '../Legend/Legend';

export type UseChartLegendSlotParams = { show: boolean } & LegendProps;

export const useChartLegendSlot = (params: UseChartLegendSlotParams): React.ReactNode => {
  const {
    show,
    backgroundColor,
    textColor,
    series,
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
        series={series}
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
    series,
    seriesVisibility,
    seriesGroupKeys,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  ]);
};
