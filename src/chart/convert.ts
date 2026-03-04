/**
 * Data and shape conversion helpers.
 * Converts generic types to implementation-ready formats.
 */

import type { ChartData, ChartLineStyle, ChartLineShape, ChartOptions, ChartShape, DashConfig } from './types'

/** Convert DashConfig to SciChart strokeDashArray. Returns undefined for solid lines. */
export const dashToStrokeArray = (dash?: DashConfig): number[] | undefined =>
  dash?.isDash && dash.steps?.length ? dash.steps : undefined

export interface ConvertedData {
  x: Float64Array
  ys: Float64Array[]
  seriesNames?: string[]
  seriesColors?: string[]
  seriesVisibility?: boolean[]
  seriesLines?: ChartLineStyle[]
  /** Per-series bindable (from seriesLines[].bindable). Default: true. */
  seriesBindable?: boolean[]
}

export interface ConvertedShape {
  color: string
  lineAxis: 'x' | 'y'
  lineValue: number
  strokeDashArray?: number[]
}

export interface ConvertedMarker {
  type: 'marker'
  x: number
  icon?: string
}

export function toFloat64Array(arr: ArrayLike<number> | number[]): Float64Array {
  if (arr instanceof Float64Array) return arr
  return new Float64Array(arr)
}

export function convertData(
  data: ChartData,
  options?: ChartOptions,
  linesProp?: ChartLineStyle[]
): ConvertedData {
  const x = toFloat64Array(data.x)
  const series = data.ys ?? data.series ?? []
  const ys = series.map((s) => toFloat64Array(s))
  const seriesLines = linesProp ?? options?.seriesLines
  const seriesBindable = Array.from(
    { length: ys.length },
    (_, i) => (seriesLines?.[i]?.bindable !== false)
  )
  return {
    x,
    ys,
    seriesNames: data.seriesNames,
    seriesColors: data.seriesColors,
    seriesVisibility: options?.seriesVisibility,
    seriesLines,
    seriesBindable,
  }
}

export interface ConvertedBox {
  name?: string
  color: string
  fill?: string
  x1?: number
  x2?: number
  y1?: number
  y2?: number
  strokeDashArray?: number[]
}

export function convertShapes(shapes: ChartShape[] = []): {
  lines: ConvertedShape[]
  boxes: ConvertedBox[]
} {
  const lines: ConvertedShape[] = []
  const boxes: ConvertedBox[] = []
  for (const s of shapes) {
    if (s.shape === 'box') {
      boxes.push({
        name: s.name,
        color: s.color,
        fill: s.fill,
        x1: s.coordinates.x1,
        x2: s.coordinates.x2,
        y1: s.coordinates.y1,
        y2: s.coordinates.y2,
        strokeDashArray: dashToStrokeArray(s.dash),
      })
    } else if (s.shape === 'line' || ('axis' in s && 'value' in s)) {
      const line = s as ChartLineShape
      lines.push({
        color: line.color,
        lineAxis: line.axis,
        lineValue: line.value,
        strokeDashArray: dashToStrokeArray(line.dash),
      })
    }
  }
  return { lines, boxes }
}

export function normalizeShape(
  s: ChartLineShape | { color: string; lineAxis: 'x' | 'y'; lineValue: number; dash?: DashConfig; strokeDashArray?: number[] }
): ConvertedShape {
  const toStroke = (d?: DashConfig, arr?: number[]) =>
    dashToStrokeArray(d) ?? arr
  if ('lineAxis' in s && 'lineValue' in s) {
    const x = s as { color: string; lineAxis: 'x' | 'y'; lineValue: number; dash?: DashConfig; strokeDashArray?: number[] }
    return {
      color: x.color,
      lineAxis: x.lineAxis,
      lineValue: x.lineValue,
      strokeDashArray: toStroke(x.dash, x.strokeDashArray),
    }
  }
  const g = s as ChartLineShape
  return {
    color: g.color,
    lineAxis: g.axis,
    lineValue: g.value,
    strokeDashArray: dashToStrokeArray(g.dash),
  }
}
