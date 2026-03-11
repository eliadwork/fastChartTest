import type { ChartImplementationOptionsWithHandlers } from '../chartImplementationContracts';
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
  const parts: string[] = ['Scroll to zoom', 'Double-click to reset to basic zoom'];

  const stretch = wrapperOptions.stretch;
  if (stretch.enable) {
    const label = TRIGGER_LABEL[stretch.trigger];
    parts.push(isKeyTrigger(stretch.trigger) ? `Hold ${label} to stretch` : `${label} to stretch`);
  }

  const pan = wrapperOptions.pan;
  if (pan.enable) {
    const label = TRIGGER_LABEL[pan.trigger];
    parts.push(`${label}+drag to pan`);
  }

  if (!chartOnly) {
    parts.push('Click legend to toggle series');
  }

  let text = parts.join(' • ');
  if (howToUseAdditional?.trim()) {
    text += `\n\n${howToUseAdditional.trim()}`;
  }
  return text;
};
