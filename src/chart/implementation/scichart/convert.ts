/**
 * SciChart data and shape conversion.
 * Converts generic chart contracts to SciChart-only definition/runtime models.
 */

import type * as React from 'react'
import { EResamplingMode } from 'scichart'

import { withOpacity } from '../../../utils/colorUtils'
import { DEFAULT_SHAPE_STYLE, DEFAULT_TEXT_COLOR, DEFAULT_ZERO_LINE_COLOR } from '../../defaults'
import type { ChartData, ChartLineShape, DashConfig } from '../../types'
import type {
  ChartImplementationEvents,
  ChartImplementationOptions,
  ChartImplementationProps,
  ChartZoomCallbacks,
  KeyTriggeredOption,
} from '../implementationProps'
import {
  SCI_CHART_DEFAULT_ICON_COLOR,
  SCI_CHART_DEFAULT_ROLLOVER_STROKE,
  SCI_CHART_DEFAULT_SERIES_COLORS,
  SCI_CHART_DEFAULT_STROKE_THICKNESS,
  SCI_CHART_RESAMPLING_PRECISION_DEFAULT,
  SCI_CHART_RESAMPLING_PRECISION_OFF,
} from './sciChartWrapperConstants'
import type {
  SciChartOptions,
  scichartData,
  scichartDataSeries,
  scichartDefaultStyles,
  scichartFullDefinition,
  scichartStyles,
  sciChartBoxShape,
  sciChartClickEvents,
  sciChartIcon,
  sciChartKeyEvents,
  sciChartLineShape,
  sciChartShape,
  sciChartZoomCallbacks,
} from './scichartOptions'

/** Convert DashConfig to SciChart strokeDashArray. Returns undefined for solid lines. */
export const dashToStrokeArray = (dash?: DashConfig): number[] | undefined =>
  dash?.isDash && dash.steps.length > 0 ? dash.steps : undefined

export interface SciChartLineRuntimeShape {
  color: string
  lineAxis: 'x' | 'y'
  lineValue: number
  strokeDashArray?: number[]
}

export interface SciChartBoxRuntimeShape {
  name?: string
  color: string
  fill?: string
  x1?: number
  x2?: number
  y1?: number
  y2?: number
  strokeDashArray?: number[]
}

export function toFloat64Array(arr: ArrayLike<number> | number[]): Float64Array {
  if (Object.prototype.toString.call(arr) === '[object Float64Array]') {
    return arr as Float64Array
  }
  return new Float64Array(arr)
}

export function convertData(data: ChartData, seriesVisibility: boolean[]): scichartData {
  const series: scichartDataSeries[] = data.map((line) => ({
    x: toFloat64Array(line.x),
    y: toFloat64Array(line.y),
    name: line.name,
    lineGroupKey: line.lineGroupKey,
    style: {
      color: line.style.color,
      thickness: line.style.thickness,
      dash: line.style.dash,
    },
  }))

  return {
    series,
    seriesVisibility,
  }
}

export function convertShapes(shapes: sciChartShape[]): {
  lines: SciChartLineRuntimeShape[]
  boxes: SciChartBoxRuntimeShape[]
} {
  const lines: SciChartLineRuntimeShape[] = []
  const boxes: SciChartBoxRuntimeShape[] = []

  for (const shape of shapes) {
    if (shape.shape === 'box') {
      boxes.push({
        name: shape.name,
        color: shape.color,
        fill: shape.fill,
        x1: shape.coordinates.x1,
        x2: shape.coordinates.x2,
        y1: shape.coordinates.y1,
        y2: shape.coordinates.y2,
        strokeDashArray: dashToStrokeArray(shape.dash),
      })
      continue
    }

    lines.push({
      color: shape.color ?? SHAPE_DEFAULT_COLOR,
      lineAxis: shape.axis,
      lineValue: shape.value,
      strokeDashArray: dashToStrokeArray(shape.dash),
    })
  }

  return { lines, boxes }
}

const DEFAULT_STRETCH: KeyTriggeredOption = { enable: true, trigger: 'rightClick' }
const DEFAULT_PAN: KeyTriggeredOption = { enable: true, trigger: 'shift' }
const DEFAULT_RESAMPLING = { enable: false, precision: 0 }
const SHAPE_DEFAULT_COLOR = DEFAULT_SHAPE_STYLE.color ?? '#ff0000'
const SCI_CHART_DEFAULT_STYLE_OVERRIDES: scichartDefaultStyles = {
  seriesColors: [...SCI_CHART_DEFAULT_SERIES_COLORS],
  strokeThickness: SCI_CHART_DEFAULT_STROKE_THICKNESS,
  iconColor: SCI_CHART_DEFAULT_ICON_COLOR,
}

const NOOP_MOUSE_HANDLER = (_event: MouseEvent): void => {}
const NOOP_WHEEL_HANDLER = (_event: WheelEvent): void => {}
const NOOP_VOID_HANDLER = (_value?: unknown): void => {}
const NOOP_PUSH_BEFORE_RESET_REF: React.MutableRefObject<(() => void) | null> = {
  current: null,
}

function applyShapeDefaults(shapes: ChartImplementationOptions['shapes']): sciChartShape[] {
  if (!shapes) {
    return []
  }

  const normalized: sciChartShape[] = []
  for (const shape of shapes) {
    if (shape.shape === 'box') {
      const boxShape: sciChartBoxShape = {
        shape: 'box',
        name: shape.name,
        color: shape.color,
        fill: shape.fill,
        coordinates: {
          x1: shape.coordinates.x1,
          x2: shape.coordinates.x2,
          y1: shape.coordinates.y1,
          y2: shape.coordinates.y2,
        },
        dash: shape.dash,
      }
      normalized.push(boxShape)
      continue
    }

    const lineShape = shape as ChartLineShape
    const normalizedLine: sciChartLineShape = {
      shape: 'line',
      color: lineShape.color ?? SHAPE_DEFAULT_COLOR,
      axis: lineShape.axis,
      value: lineShape.value,
      dash: lineShape.dash ?? DEFAULT_SHAPE_STYLE.dash,
    }
    normalized.push(normalizedLine)
  }

  return normalized
}

function buildClickEvents(events: ChartImplementationEvents | undefined): sciChartClickEvents {
  const middle = (
    event: MouseEvent,
    xValue?: number,
    yValue?: number,
    getSeriesVisibility?: () => boolean[]
  ) => {
    events?.onmiddleclick?.(
      event,
      xValue ?? Number.NaN,
      yValue ?? Number.NaN,
      getSeriesVisibility
    )
  }

  return {
    right: events?.onrightclick ?? NOOP_MOUSE_HANDLER,
    left: events?.onleftclick ?? NOOP_MOUSE_HANDLER,
    double: events?.ondoubleclick ?? NOOP_MOUSE_HANDLER,
    middle,
  }
}

function buildKeyEvents(events: ChartImplementationEvents | undefined): sciChartKeyEvents {
  return {
    shift: events?.onshiftclick ?? NOOP_MOUSE_HANDLER,
    ctrl: events?.onctrlclick ?? NOOP_MOUSE_HANDLER,
    alt: events?.onaltclick ?? NOOP_MOUSE_HANDLER,
  }
}

function buildZoomCallbacks(
  zoomCallbacks: ChartZoomCallbacks | undefined
): sciChartZoomCallbacks {
  if (zoomCallbacks) {
    return zoomCallbacks
  }

  return {
    setZoomBack: NOOP_VOID_HANDLER,
    setZoomReset: NOOP_VOID_HANDLER,
    setCanZoomBack: NOOP_VOID_HANDLER,
    setPushBeforeReset: NOOP_VOID_HANDLER,
    pushBeforeResetRef: NOOP_PUSH_BEFORE_RESET_REF,
  }
}

function buildEvents(
  events: ChartImplementationEvents | undefined,
  zoomCallbacks: ChartZoomCallbacks | undefined
): SciChartOptions['events'] {
  const hasRegularEvent =
    events?.onrightclick != null ||
    events?.onleftclick != null ||
    events?.ondoubleclick != null ||
    events?.onmiddleclick != null ||
    events?.onshiftclick != null ||
    events?.onctrlclick != null ||
    events?.onaltclick != null ||
    events?.onscroll != null

  if (!hasRegularEvent && !zoomCallbacks) {
    return undefined
  }

  return {
    clicks: buildClickEvents(events),
    keys: buildKeyEvents(events),
    zoom: buildZoomCallbacks(zoomCallbacks),
    scroll: events?.onscroll ?? NOOP_WHEEL_HANDLER,
  }
}

function buildStyles(props: ChartImplementationProps): scichartStyles {
  const defaultStyles: scichartDefaultStyles = {
    seriesColors: props.style.defaultChartLineStyles?.color
      ? [props.style.defaultChartLineStyles.color]
      : SCI_CHART_DEFAULT_STYLE_OVERRIDES.seriesColors,
    strokeThickness:
      props.style.defaultChartLineStyles?.thickness ??
      SCI_CHART_DEFAULT_STYLE_OVERRIDES.strokeThickness,
    iconColor: SCI_CHART_DEFAULT_STYLE_OVERRIDES.iconColor,
  }

  return {
    chartOnly: props.style.chartOnly,
    backgroundColor: withOpacity(props.style.backgroundColor, 0.2),
    textColor: props.style.textColor ?? DEFAULT_TEXT_COLOR,
    zeroLineColor: props.style.zeroLineColor ?? DEFAULT_ZERO_LINE_COLOR,
    defaultStyles,
  }
}

export const toSciChartDefinition = (
  props: ChartImplementationProps,
  seriesVisibility: boolean[]
): scichartFullDefinition => {
  const optionsInput = props.options ?? {}
  const resolvedOptions: ChartImplementationOptions = {
    stretch: DEFAULT_STRETCH,
    pan: DEFAULT_PAN,
    resampling: DEFAULT_RESAMPLING,
    clipZoomToData: true,
    ...optionsInput,
    seriesVisibility,
  }

  const data = convertData(props.lines, seriesVisibility)
  const shapes = applyShapeDefaults(resolvedOptions.shapes)
  const icons: sciChartIcon[] = resolvedOptions.icons ?? []
  const styles = buildStyles(props)
  const resamplingEnabled = resolvedOptions.resampling.enable !== false

  const options: SciChartOptions = {
    features: {
      stretch: resolvedOptions.stretch,
      pan: resolvedOptions.pan,
      rollover: {
        show: props.style.rollover.show,
        color: props.style.rollover.color ?? SCI_CHART_DEFAULT_ROLLOVER_STROKE,
        dash: props.style.rollover.dash,
      },
    },
    resampling: {
      resamplingMode: resamplingEnabled
        ? EResamplingMode.Auto
        : EResamplingMode.None,
      resamplingPrecision:
        resolvedOptions.resampling.precision ??
        (resamplingEnabled
          ? SCI_CHART_RESAMPLING_PRECISION_DEFAULT
          : SCI_CHART_RESAMPLING_PRECISION_OFF),
    },
    events: buildEvents(resolvedOptions.events, props.zoomCallbacks),
    clipZoomToData: resolvedOptions.clipZoomToData,
  }

  return {
    data,
    shapes,
    icons,
    note: resolvedOptions.note,
    options,
    styles,
  }
}
