/**
 * Data and shape conversion helpers.
 * Converts generic types to implementation-ready formats.
 */

import type { ChartData, ChartLineStyle, ChartLineShape, ChartOptions, ChartShape } from './types'

export interface ConvertedData {
  x: Float64Array
  ys: Float64Array[]
  seriesNames?: string[]
  seriesColors?: string[]
  seriesVisibility?: boolean[]
  seriesLines?: ChartLineStyle[]
}

export interface ConvertedShape {
  color: string
  lineAxis: 'x' | 'y'
  lineValue: number
  strokeDashArray?: number[]
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
  return {
    x,
    ys,
    seriesNames: data.seriesNames,
    seriesColors: data.seriesColors,
    seriesVisibility: options?.seriesVisibility,
    seriesLines: linesProp ?? options?.seriesLines,
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
        strokeDashArray: s.strokeDashArray,
      })
    } else {
      lines.push({
        color: s.color,
        lineAxis: s.axis,
        lineValue: s.value,
        strokeDashArray: s.strokeDashArray,
      })
    }
  }
  return { lines, boxes }
}

export function normalizeShape(
  s: ChartLineShape | { color: string; lineAxis: 'x' | 'y'; lineValue: number; strokeDashArray?: number[] }
): ConvertedShape {
  if ('lineAxis' in s && 'lineValue' in s) {
    return {
      color: s.color,
      lineAxis: s.lineAxis,
      lineValue: s.lineValue,
      strokeDashArray: s.strokeDashArray,
    }
  }
  const g = s as ChartLineShape
  return {
    color: g.color,
    lineAxis: g.axis,
    lineValue: g.value,
    strokeDashArray: g.strokeDashArray,
  }
}
