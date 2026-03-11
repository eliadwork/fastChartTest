import { useMemo } from 'react';
import type { ChartImplementationProps } from '../../implementationProps';
import { toInternalOptions } from '../convert';

export interface UseSciChartOptionsModelOptions {
  lines: ChartImplementationProps['lines'];
  style: ChartImplementationProps['style'];
  optionsInput: ChartImplementationProps['options'];
}

export const useSciChartOptionsModel = ({
  lines,
  style,
  optionsInput,
}: UseSciChartOptionsModelOptions) => {
  const { data: convertedData, options: convertedOptions } = useMemo(
    () => toInternalOptions({ lines, style, options: optionsInput }),
    [lines, optionsInput, style]
  );

  return {
    convertedData,
    mergedOptions: convertedOptions,
  };
};
