import { useMemo } from 'react';
import type { ChartImplementationProps } from '../../implementationProps';
import { toSciChartDefinition } from '../convert';
import type { ResolvedSciChartDefinition } from '../scichartOptions';

export interface UseSciChartOptionsModelOptions {
  lines: ChartImplementationProps['lines'];
  style: ChartImplementationProps['style'];
  options: ChartImplementationProps['options'];
}

export const useSciChartOptionsModel = ({
  lines,
  style,
  options,
}: UseSciChartOptionsModelOptions): ResolvedSciChartDefinition => {
  return useMemo(() => toSciChartDefinition({ lines, style, options }), [lines, options, style]);
};
