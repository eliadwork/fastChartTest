import { useMemo } from 'react';
import type { ChartImplementationProps } from '../../../implementationProps';
import { resolveSciChartDefinition } from '../../convert';
import type { ResolvedSciChartDefinition } from '../../scichartOptions';

export interface UseSciChartOptionsModelOptions {
  definition: ChartImplementationProps['definition'];
}

export const useSciChartOptionsModel = ({
  definition,
}: UseSciChartOptionsModelOptions): ResolvedSciChartDefinition => {
  return useMemo(() => resolveSciChartDefinition(definition), [definition]);
};
