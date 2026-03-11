import {
  DEFAULT_DETECT_VISUAL_CONFIG,
  resolveDetectVisualConfig,
} from './detectVisualConfig';
export type { DetectVisualConfig } from './detectVisualConfig';
export { DEFAULT_DETECT_VISUAL_CONFIG, resolveDetectVisualConfig };

/** Additional "how to use" text for the chart info tooltip. Describes the 3-click point mark flow. */
export const DETECT_HOW_TO_USE_ADDITIONAL =
  'For 3-point mark: middle-click 3 times, pick a series and color in the modal, then confirm.';

/** Tooltip when shapes/icons for hidden series are shown. */
export const DETECT_TOOLTIP_SHOW_SHAPES_FOR_HIDDEN = 'Show shapes for hidden series';

/** Tooltip when shapes/icons for hidden series are hidden. */
export const DETECT_TOOLTIP_HIDE_SHAPES_FOR_HIDDEN = 'Hide shapes for hidden series';
