import type { ChartData } from '../../../chart';

import { useCallback, useState } from 'react';

import { useAddDemoLineMutation } from '../mutations/useAddDemoLineMutation';
import { useChartDataQuery } from '../queries/useChartDataQuery';

export interface UseChartDataFlowResult {
  chartData: ChartData | null;
  isLoading: boolean;
  canAddLine: boolean;
  addLine: () => void;
}

export const useChartDataFlow = (): UseChartDataFlowResult => {
  const [nextCopyIndex, setNextCopyIndex] = useState(1);
  const chartDataQuery = useChartDataQuery();
  const addDemoLineMutation = useAddDemoLineMutation();

  const chartData = chartDataQuery.data ?? null;
  const canAddLine =
    chartData != null && chartData.length > 0 && !chartDataQuery.isPending && !addDemoLineMutation.isPending;

  const addLine = useCallback(() => {
    if (!canAddLine) {
      return;
    }

    const currentCopyIndex = nextCopyIndex;
    setNextCopyIndex((previousCopyIndex) => previousCopyIndex + 1);
    addDemoLineMutation.mutate({ copyIndex: currentCopyIndex });
  }, [addDemoLineMutation, canAddLine, nextCopyIndex]);

  return {
    chartData,
    isLoading: chartDataQuery.isPending,
    canAddLine,
    addLine,
  };
};
