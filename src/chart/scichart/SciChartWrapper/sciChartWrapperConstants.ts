/** SciChart WASM URLs. */
export const SCI_CHART_WASM_URL = '/scichart2d.wasm'
export const SCI_CHART_WASM_NO_SIMD_URL = '/scichart2d-nosimd.wasm'

/** Fallback when theme/defaults not provided. */
export const SCI_CHART_DEFAULT_SERIES_COLORS = [
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
] as const

export const SCI_CHART_DEFAULT_STROKE_THICKNESS = 2
export const SCI_CHART_DEFAULT_ROLLOVER_STROKE = '#FF0000'
export const SCI_CHART_DEFAULT_ROLLOVER_DASH = [8, 4] as number[]
export const SCI_CHART_DEFAULT_POINT_MARK_ICON = '📍'
export const SCI_CHART_DEFAULT_POINT_MARK_COLOR = '#3388ff'
export const SCI_CHART_DEFAULT_AXIS_LABEL_COLOR = '#ffffff'
export const SCI_CHART_DEFAULT_TEXT_COLOR = '#ffffff'
export const SCI_CHART_DEFAULT_ZERO_LINE_COLOR = '#ffffff'

/** Zero line and shape annotation stroke thickness. */
export const SCI_CHART_ZERO_LINE_STROKE_THICKNESS = 1
export const SCI_CHART_SHAPE_STROKE_THICKNESS = 2

/** Box fill opacity suffix (hex). */
export const SCI_CHART_BOX_FILL_OPACITY_SUFFIX = '33'

/** Resampling precision when enabled. */
export const SCI_CHART_RESAMPLING_PRECISION_DEFAULT = 1

/** Resampling precision when disabled. */
export const SCI_CHART_RESAMPLING_PRECISION_OFF = 0

/** Axis visible range padding factor for clipZoomToData. */
export const SCI_CHART_VISIBLE_RANGE_PAD_FACTOR = 1e-6

/** Box annotation default coordinates when no data bounds. */
export const SCI_CHART_BOX_DEFAULT_X1 = 0
export const SCI_CHART_BOX_DEFAULT_X2 = 1
export const SCI_CHART_BOX_DEFAULT_Y1 = 0
export const SCI_CHART_BOX_DEFAULT_Y2 = 1

/** Axis stretch modifier sensitivity. */
export const SCI_CHART_STRETCH_SENSITIVITY = 0.5

/** Point mark icon size default. */
export const SCI_CHART_POINT_MARK_ICON_SIZE_DEFAULT = 1.5

/** Box label font size. */
export const SCI_CHART_BOX_LABEL_FONT_SIZE = 12

/** Loading spinner size. */
export const SCI_CHART_LOADING_SPINNER_SIZE = 40
