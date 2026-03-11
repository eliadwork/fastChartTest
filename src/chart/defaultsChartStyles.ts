/**
 * Default values for SciChartWrapper and shape styling.
 */

import type { ChartLineStyle } from './types';

import type { ChartIcon } from './types';

import { DEFAULT_POINT_MARK_ICON_SVG } from '../assets/pointMarkIcon';

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

/** Opacity for chart background when using theme backgroundColor. */
export const CHART_BACKGROUND_OPACITY_DEFAULT = 0.2;

/** Opacity for legend background when using theme backgroundColor. */
export const CHART_LEGEND_BACKGROUND_OPACITY = 0.08;

/** Fallback background when theme has no backgroundColor. */
export const CHART_FALLBACK_BACKGROUND = '#1a1a1a';

/** Fallback text color. */
export const CHART_FALLBACK_TEXT_COLOR = '#ffffff';

/** Fallback rollover stroke color. */
export const CHART_FALLBACK_ROLLOVER_STROKE = '#FF0000';

/** Default series colors when not specified per-series. */
export const CHART_DEFAULT_SERIES_COLORS = [
  '#3ca832',
  '#eb911c',
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
];

/** Default series stroke thickness when unspecified. */
export const CHART_DEFAULT_STROKE_THICKNESS = 2;

/** Default rollover dash steps. */
export const CHART_ROLLOVER_DASH_STEPS = [8, 4] as const;

export const CHART_DEFAULT_ICON_COLOR = '#3388ff';
export const CHART_SAMPLE_ICON_COLOR = '#3388ff';

export const DEFAULT_CHART_ICONS: ChartIcon[] = [
  {
    iconImage: DEFAULT_POINT_MARK_ICON_SVG,
    location: { x: 250000, y: 0 },
    color: CHART_SAMPLE_ICON_COLOR,
  },
];
