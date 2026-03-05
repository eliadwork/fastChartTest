/**
 * Converts SciChartWrapper props to internal ChartOptions and ConvertedData.
 */

import type { ChartOptions, ChartLineShape, ChartShape } from '../types'
import type { ConvertedData } from '../convert'
import { withOpacity } from '../../chartTheme'
import {
  DEFAULT_LEGEND_BACKGROUND_COLOR,
  DEFAULT_SHAPE_STYLE,
  DEFAULT_TEXT_COLOR,
  DEFAULT_ZERO_LINE_COLOR,
} from './defaults'
import type { SciChartWrapperProps, SciChartWrapperOptions, TriggerKey } from './types'

const DEFAULT_STRETCH = { enable: true, trigger: 'rightClick' as TriggerKey }
const DEFAULT_PAN = { enable: true, trigger: 'shift' as TriggerKey }
const DEFAULT_RESAMPLING = { enable: true, precision: 1 }

function applyShapeDefaults(shapes: ChartShape[] = []): ChartShape[] {
  return shapes.map((shape) => {
    if (shape.shape === 'box') return shape
    const line = shape as ChartLineShape
    return {
      ...line,
      color: line.color ?? DEFAULT_SHAPE_STYLE.color,
      dash: line.dash ?? DEFAULT_SHAPE_STYLE.dash,
    }
  })
}

export const toInternalOptions = (
  props: SciChartWrapperProps,
  seriesVisibility: boolean[]
): { data: ConvertedData; options: ChartOptions } => {
  const { lines, style, options: opts = {} } = props
  const opt: SciChartWrapperOptions = {
    stretch: DEFAULT_STRETCH,
    pan: DEFAULT_PAN,
    resampling: DEFAULT_RESAMPLING,
    clipZoomToData: true,
    ...opts,
  }

  const shapesWithDefaults = applyShapeDefaults(opt.shapes)

  const seriesBindable = lines.map((series) => series.style.bindable !== false)
  const data: ConvertedData = {
    series: lines,
    seriesVisibility,
    seriesBindable,
  }

  const stretchEnable = opt.stretch.enable
  const stretchTrigger = stretchEnable ? opt.stretch.trigger : undefined
  const panEnable = opt.pan.enable
  const panTrigger = panEnable ? opt.pan.trigger : undefined

  const backgroundColor =
    style.backgroundColor != null
      ? withOpacity(style.backgroundColor, 0.2)
      : undefined

  const options: ChartOptions = {
    chartOnly: style.chartOnly,
    shapes: shapesWithDefaults,
    stretchTrigger,
    stretchEnable,
    panTrigger: panTrigger === 'shift' ? 'Shift' : panTrigger,
    panEnable,
    clipZoomToData: opt.clipZoomToData,
    resampling: opt.resampling.enable,
    resamplingPrecision: opt.resampling.precision,
    backgroundColor,
    textColor: style.textColor ?? DEFAULT_TEXT_COLOR,
    zeroLineColor: style.zeroLineColor ?? DEFAULT_ZERO_LINE_COLOR,
    legendBackgroundColor:
      style.legendBackgroundColor ?? DEFAULT_LEGEND_BACKGROUND_COLOR,
    defaultSeriesColors: style.defaultChartLineStyles?.color
      ? [style.defaultChartLineStyles.color]
      : undefined,
    defaultStrokeThickness: style.defaultChartLineStyles?.thickness,
    rolloverStroke: style.rollover.show ? style.rollover.color : undefined,
    rolloverDash: style.rollover.show ? style.rollover.dash : undefined,
    rolloverShow: style.rollover.show,
    icons: opt.icons,
    seriesVisibility,
    seriesGroupKeys: opt.seriesGroupKeys ?? lines.map((series) => series.lineGroupKey),
  }

  return { data, options }
}
