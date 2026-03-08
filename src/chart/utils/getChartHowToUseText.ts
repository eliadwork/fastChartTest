import type { ChartImplementationOptionsWithHandlers } from '../implementation/implementationProps';
import type { TriggerKey } from '../types';

const TRIGGER_LABEL: Record<TriggerKey, string> = {
  rightClick: 'Right-click',
  leftClick: 'Left-click',
  shift: 'Shift',
  ctrl: 'Ctrl',
  alt: 'Alt',
};

const isKeyTrigger = (trigger: TriggerKey): boolean =>
  trigger === 'shift' || trigger === 'ctrl' || trigger === 'alt';

export interface GetChartHowToUseTextParams {
  wrapperOptions: ChartImplementationOptionsWithHandlers;
  chartOnly: boolean;
  howToUseAdditional?: string;
}

export const getChartHowToUseText = ({
  wrapperOptions,
  chartOnly,
  howToUseAdditional,
}: GetChartHowToUseTextParams): string => {
  const parts: string[] = ['Scroll to zoom'];

  const stretch = wrapperOptions.stretch;
  if (stretch?.enable && stretch.trigger != null) {
    const label = TRIGGER_LABEL[stretch.trigger];
    parts.push(
      isKeyTrigger(stretch.trigger)
        ? `Hold ${label} to stretch`
        : `${label} to stretch`
    );
  }

  const pan = wrapperOptions.pan;
  if (pan?.enable && pan.trigger != null) {
    const label = TRIGGER_LABEL[pan.trigger];
    parts.push(`${label}+drag to pan`);
  }

  if (!chartOnly) {
    parts.push('Click legend to toggle series');
  }

  const hasPointMark = !!wrapperOptions.events?.onmiddleclick;
  if (hasPointMark) {
    parts.push('Middle-click for 3-point mark');
  }

  let text = parts.join(' • ');
  if (howToUseAdditional?.trim()) {
    text += `\n\n${howToUseAdditional.trim()}`;
  }
  return text;
};
