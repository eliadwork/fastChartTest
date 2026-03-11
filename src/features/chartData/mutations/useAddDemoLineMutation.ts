import type { ChartData } from '../../../chart';
import type { AddDemoLineInput } from '../chartDataContracts';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addDemoLineToChartData } from '../chartDataClient';
import { chartDataQueryKey } from '../chartDataQueryKeys';
import { resolveChartDataSourceMode } from '../chartDataSourceMode';

export const useAddDemoLineMutation = () => {
  const queryClient = useQueryClient();
  const sourceMode = resolveChartDataSourceMode();

  return useMutation({
    mutationFn: async (input: AddDemoLineInput) => {
      if (sourceMode !== 'worker') {
        throw new Error('API mutation mode is not implemented yet.');
      }
      const currentChartData = queryClient.getQueryData<ChartData>(chartDataQueryKey) ?? [];
      return addDemoLineToChartData(currentChartData, input);
    },
    onSuccess: (nextChartData) => {
      queryClient.setQueryData(chartDataQueryKey, nextChartData);
    },
  });
};
