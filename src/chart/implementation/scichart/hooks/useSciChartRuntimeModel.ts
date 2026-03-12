import type { ResolvedSciChartDefinition } from '../scichartOptions';

import { useSciChartDataBounds } from './useSciChartDataBounds';
import { useSciChartInitChart } from './useSciChartInitChart';

export interface UseSciChartRuntimeModelOptions {
  definition: ResolvedSciChartDefinition;
}

export const useSciChartRuntimeModel = ({
  definition,
}: UseSciChartRuntimeModelOptions) => {
  const dataBounds = useSciChartDataBounds(definition.data);

  const initChart = useSciChartInitChart({
    definition,
    dataBounds,
  });

  return {
    initChart,
    dataBounds,
  };
};
