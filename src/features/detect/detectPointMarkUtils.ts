import type { ChartLineShape } from '../../chart/types';

import {
  DETECT_PENDING_LINE_COLOR,
  DETECT_PENDING_LINE_DASH_INDEX,
  DETECT_PENDING_LINE_DASH_STEPS,
} from './detectPointMarkConstants';

export const createPendingLineShape = (
  index: number,
  xValue: number,
  color: string = DETECT_PENDING_LINE_COLOR
): ChartLineShape => {
  const dash =
    index === DETECT_PENDING_LINE_DASH_INDEX
      ? { isDash: true, steps: [...DETECT_PENDING_LINE_DASH_STEPS] }
      : undefined;
  return {
    axis: 'x',
    value: xValue,
    color,
    dash,
  };
};
