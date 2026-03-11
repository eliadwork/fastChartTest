import { useQuery } from '@tanstack/react-query';

import { fetchChartData } from '../chartDataClient';
import { chartDataQueryKey } from '../chartDataQueryKeys';

export const useChartDataQuery = () =>
  useQuery({
    queryKey: chartDataQueryKey,
    queryFn: fetchChartData,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
