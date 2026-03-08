export type PointMarkColor = 'red' | 'green' | 'yellow';

export const DETECT_PENDING_LINE_COLOR = '#b85c5c';

export const DETECT_POINT_MARK_COLORS: PointMarkColor[] = ['red', 'green', 'yellow'];

export const DETECT_COLOR_HEX_BY_NAME: Record<PointMarkColor, string> = {
  red: '#b85c5c',
  green: '#5a9a5a',
  yellow: '#b8a84a',
};
