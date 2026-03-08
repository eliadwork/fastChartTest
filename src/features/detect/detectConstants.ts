export type PointMarkColor = 'red' | 'green' | 'yellow';

export const DETECT_PENDING_LINE_COLOR = '#b85c5c';

export const DETECT_POINT_MARK_COLORS: PointMarkColor[] = ['red', 'green', 'yellow'];

export const DETECT_COLOR_HEX_BY_NAME: Record<PointMarkColor, string> = {
  red: '#b85c5c',
  green: '#5a9a5a',
  yellow: '#b8a84a',
};

/** Additional "how to use" text for the chart info tooltip. Describes the 3-click point mark flow. */
export const DETECT_HOW_TO_USE_ADDITIONAL =
  'For 3-point mark: middle-click 3 times, pick a series and color in the modal, then confirm.';

/** Tooltip when shapes/icons for hidden series are shown. */
export const DETECT_TOOLTIP_SHOW_SHAPES_FOR_HIDDEN = 'Show shapes for hidden series';

/** Tooltip when shapes/icons for hidden series are hidden. */
export const DETECT_TOOLTIP_HIDE_SHAPES_FOR_HIDDEN = 'Hide shapes for hidden series';
