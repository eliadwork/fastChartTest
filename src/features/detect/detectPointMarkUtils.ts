import type { ChartLineShape } from '../../chart/types';

import { DETECT_PENDING_LINE_COLOR } from './detectConstants';

export const EMPTY_LINE_SHAPES: ChartLineShape[] = [];

export const createPendingLineShape = (
  index: number,
  xValue: number
): ChartLineShape => {
  const dash = index === 1 ? { isDash: true, steps: [8, 4] } : undefined;
  return {
    axis: 'x',
    value: xValue,
    color: DETECT_PENDING_LINE_COLOR,
    dash,
  };
};
