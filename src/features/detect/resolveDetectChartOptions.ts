import type { ChartOptions } from '../../chart';

import { DETECT_HOW_TO_USE_ADDITIONAL } from './detectConstants';
import type { DetectHoverEvent } from './hooks/detectPointMarkFlowTypes';

export interface ResolveDetectChartOptionsParams {
  options: ChartOptions;
  hasData: boolean;
  onMiddleClick: (event: MouseEvent) => void;
}

const detectHoverLogger = (event: MouseEvent) => {
  console.log('detect hover x:', (event as DetectHoverEvent).chartXValue);
};

export const resolveDetectChartOptions = ({
  options,
  hasData,
  onMiddleClick,
}: ResolveDetectChartOptionsParams): ChartOptions => {
  if (!hasData) {
    return {
      ...options,
      howToUseAdditional: options.howToUseAdditional ?? DETECT_HOW_TO_USE_ADDITIONAL,
      events: {
        ...options.events,
        onhover: detectHoverLogger,
      },
    };
  }

  return {
    ...options,
    howToUseAdditional: options.howToUseAdditional ?? DETECT_HOW_TO_USE_ADDITIONAL,
    events: {
      ...options.events,
      onmiddleclick: onMiddleClick,
      onhover: detectHoverLogger,
    },
  };
};
