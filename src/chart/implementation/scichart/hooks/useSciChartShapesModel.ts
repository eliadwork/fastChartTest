import type { ResolvedSciChartDefinition } from '../scichartOptions';

import { useMemo } from 'react';

export const useSciChartShapesModel = (shapes: ResolvedSciChartDefinition['shapes']) => {
  return useMemo(() => shapes, [shapes]);
};
