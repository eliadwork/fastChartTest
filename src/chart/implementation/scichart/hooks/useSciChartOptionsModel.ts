import { useMemo } from 'react';
import type { ChartImplementationProps } from '../../implementationProps';
import {
  CHART_DEFAULT_SERIES_COLORS,
  CHART_FALLBACK_ROLLOVER_STROKE,
  CHART_ROLLOVER_DASH_STEPS,
} from '../../../defaultsChartStyles';
import { toInternalOptions } from '../convert';
import { useSciChartMergedOptions } from './useSciChartMergedOptions';

const SCI_CHART_THEME_DEFAULTS = {
  defaultSeriesColors: CHART_DEFAULT_SERIES_COLORS,
  rolloverStroke: CHART_FALLBACK_ROLLOVER_STROKE,
  rolloverDash: { isDash: true, steps: [...CHART_ROLLOVER_DASH_STEPS] },
};

export interface UseSciChartOptionsModelOptions {
  chartId?: string;
  lines: ChartImplementationProps['lines'];
  style: ChartImplementationProps['style'];
  optionsInput: NonNullable<ChartImplementationProps['options']>;
}

export const useSciChartOptionsModel = ({
  chartId,
  lines,
  style,
  optionsInput,
}: UseSciChartOptionsModelOptions) => {
  const seriesVisibility = useMemo(
    () => optionsInput.seriesVisibility ?? Array.from({ length: lines.length }, () => true),
    [optionsInput.seriesVisibility, lines.length]
  );

  const { data: convertedData, options: convertedOptions } = useMemo(
    () => toInternalOptions({ chartId, lines, style, options: optionsInput }, seriesVisibility),
    [chartId, lines, optionsInput, seriesVisibility, style]
  );

  const mergedOptions = useSciChartMergedOptions({
    convertedOptions,
    chartTheme: SCI_CHART_THEME_DEFAULTS,
    optionHandlers: optionsInput,
  });

  return {
    convertedData,
    mergedOptions,
  };
};
