import { useMemo } from 'react';
import type { ChartImplementationProps } from '../../implementationProps';
import type { SciChartConvertedOptions } from '../convert';

/** Internal: merged options with shapes, icons, and visibility handlers for SciChart. */
export type SciChartMergedOptions = SciChartConvertedOptions & {
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void;
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void;
  onDisableAll?: () => void;
};

export interface UseSciChartMergedOptionsParams {
  convertedOptions: SciChartConvertedOptions;
  chartTheme: {
    defaultSeriesColors: string[];
    rolloverStroke?: string;
    rolloverDash?: { isDash: boolean; steps: number[] };
  };
  optionHandlers: Pick<
    NonNullable<ChartImplementationProps['options']>,
    'onSeriesVisibilityChange' | 'onSeriesVisibilityGroupChange' | 'onDisableAll'
  >;
}

export const useSciChartMergedOptions = ({
  convertedOptions,
  chartTheme,
  optionHandlers,
}: UseSciChartMergedOptionsParams): SciChartMergedOptions => {
  return useMemo(
    () => ({
      ...convertedOptions,
      defaultSeriesColors: convertedOptions.defaultSeriesColors ?? chartTheme.defaultSeriesColors,
      rolloverStroke: convertedOptions.rolloverStroke ?? chartTheme.rolloverStroke,
      rolloverDash: convertedOptions.rolloverDash ?? chartTheme.rolloverDash,
      onSeriesVisibilityChange: optionHandlers.onSeriesVisibilityChange,
      onSeriesVisibilityGroupChange: optionHandlers.onSeriesVisibilityGroupChange,
      onDisableAll: optionHandlers.onDisableAll,
    }),
    [
      convertedOptions,
      chartTheme,
      optionHandlers.onSeriesVisibilityChange,
      optionHandlers.onSeriesVisibilityGroupChange,
      optionHandlers.onDisableAll,
    ]
  );
};
