/**
 * Default values for SciChartWrapper and shape styling.
 */

import type { ChartLineStyle } from './types';

/** Default styling for shapes when no style is specified. */
export const DEFAULT_SHAPE_STYLE: Pick<ChartLineStyle, 'color' | 'thickness' | 'dash'> = {
  color: '#ff0000',
  thickness: 4,
  dash: undefined, // solid line
};

export const DEFAULT_ZERO_LINE_COLOR = '#ffffff';
/** Almost completely translucent – subtle tint only. */
export const DEFAULT_LEGEND_BACKGROUND_COLOR = 'rgba(0,0,0,0.08)';
export const DEFAULT_TEXT_COLOR = '#ffffff';
