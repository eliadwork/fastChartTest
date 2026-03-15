import type { ResolvedSciChartDefinition } from '../../scichartOptions';

import { useSciChartDataBoundsModel } from '../model/useSciChartDataBoundsModel';
import { useSciChartInitChartFlow } from './useSciChartInitChartFlow';

export interface UseSciChartRuntimeFlowOptions {
  definition: ResolvedSciChartDefinition;
}

export const useSciChartRuntimeFlow = ({
  definition,
}: UseSciChartRuntimeFlowOptions) => {
  const dataBounds = useSciChartDataBoundsModel(definition.data);

  const initChart = useSciChartInitChartFlow({
    definition,
    dataBounds,
  });

  return {
    initChart,
    dataBounds,
  };
};
