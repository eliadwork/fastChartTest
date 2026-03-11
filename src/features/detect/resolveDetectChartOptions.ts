import type { ChartOptions } from '../../chart';

import { DETECT_HOW_TO_USE_ADDITIONAL } from './detectConstants';

export interface ResolveDetectChartOptionsParams {
  options: ChartOptions;
  hasData: boolean;
  onMiddleClick: (event: MouseEvent) => void;
}

export const resolveDetectChartOptions = ({
  options,
  hasData,
  onMiddleClick,
}: ResolveDetectChartOptionsParams): ChartOptions => {
  if (!hasData) {
    return {
      ...options,
      howToUseAdditional: options.howToUseAdditional ?? DETECT_HOW_TO_USE_ADDITIONAL,
    };
  }

  return {
    ...options,
    howToUseAdditional: options.howToUseAdditional ?? DETECT_HOW_TO_USE_ADDITIONAL,
    events: {
      ...options.events,
      onmiddleclick: onMiddleClick,
    },
  };
};
