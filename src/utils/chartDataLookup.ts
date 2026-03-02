/**
 * Chart data lookup utilities.
 * Given an X value from a chart click, find the corresponding Y value
 * (nearest data point) for use across multiple charts.
 */

export interface ChartDataLike {
  x: ArrayLike<number> | number[]
  ys: (ArrayLike<number> | number[])[]
}

/**
 * Finds the nearest data point to xTarget in the (x, y) arrays.
 * Uses binary search for O(log n) lookup on sorted x.
 */
export function findNearestPoint(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  xTarget: number
): { x: number; y: number } {
  const n = x.length
  if (n === 0) return { x: NaN, y: NaN }
  if (xTarget <= x[0]) return { x: Number(x[0]), y: Number(y[0]) }
  if (xTarget >= x[n - 1]) return { x: Number(x[n - 1]), y: Number(y[n - 1]) }

  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (x[mid] <= xTarget) lo = mid
    else hi = mid
  }
  const x0 = Number(x[lo])
  const x1 = Number(x[hi])
  const dist0 = Math.abs(xTarget - x0)
  const dist1 = Math.abs(xTarget - x1)
  const idx = dist0 <= dist1 ? lo : hi
  return { x: Number(x[idx]), y: Number(y[idx]) }
}

/**
 * Gets the nearest (x, y) point for a given xValue and series index.
 * Reusable across multiple charts - pass any chart data that has x and ys.
 */
export function getNearestPointAtX(
  chartData: ChartDataLike,
  xValue: number,
  seriesIndex: number
): { x: number; y: number } | null {
  const yValues = chartData.ys[seriesIndex]
  if (!yValues) return null
  return findNearestPoint(chartData.x, yValues, xValue)
}
