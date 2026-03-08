import type { PointMarkColor } from '../../store/pointMarkStore';

export const DETECT_PENDING_LINE_COLOR = '#ff0000';

export const DETECT_POINT_MARK_COLORS: PointMarkColor[] = ['red', 'green', 'yellow'];

export const DETECT_COLOR_HEX_BY_NAME: Record<PointMarkColor, string> = {
  red: '#ff0000',
  green: '#00ff00',
  yellow: '#ffff00',
};
