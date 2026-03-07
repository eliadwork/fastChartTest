/** Legend line SVG dimensions and viewBox. */
export const LEGEND_LINE_WIDTH = '1.25em'
export const LEGEND_LINE_HEIGHT = '0.5em'
export const LEGEND_LINE_VIEWBOX = '0 0 20 8'
export const LEGEND_LINE_X1 = 0
export const LEGEND_LINE_Y1 = 4
export const LEGEND_LINE_X2 = 20
export const LEGEND_LINE_Y2 = 4

export const STROKE_DASHARRAY_NONE = 'none'

/** Opacity for visible vs hidden legend items. */
export const LEGEND_OPACITY_VISIBLE = 1
export const LEGEND_OPACITY_HIDDEN = 0.5

/** Text decoration for visible vs hidden legend items. */
export const LEGEND_TEXT_DECORATION_VISIBLE = 'none'
export const LEGEND_TEXT_DECORATION_HIDDEN = 'line-through'

/** Indent for nested series under a group (rem). */
export const LEGEND_ITEM_INDENT = '1.5rem'

/** Max height of legend container. */
export const LEGEND_MAX_HEIGHT = '90%'

/** Default fallback when series has no name. */
export const LEGEND_SERIES_NAME_PREFIX = 'Series'

/** Default stroke color when series has none. */
export const LEGEND_DEFAULT_STROKE = '#888'

/** Default stroke thickness when series has none. */
export const LEGEND_DEFAULT_STROKE_THICKNESS = 2

/** Default values for theme.chartLegend. */
export const CHART_LEGEND_THEME_DEFAULTS = {
  zIndex: 10,
  inset: 0.5,
  gap: 0.35,
  padding: 0.6,
  paddingBlock: 0.4,
  borderRadius: 0.25,
  groupGap: 0.1,
  itemPaddingBlock: 0.15,
  fontSize: 0.8,
  defaultBackground: 'rgba(0,0,0,0.6)',
  defaultTextColor: '#ffffff',
} as const
