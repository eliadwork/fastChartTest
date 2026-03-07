/**
 * Chart data lookup utilities.
 * Given an X value from a chart click, find the corresponding Y value
 * (nearest data point) for use across multiple charts.
 */

export interface ChartDataLike {
  /** Array of lines, each with x and y. Used for per-line data format. */
  lines?: Array<{ x: ArrayLike<number> | number[]; y: ArrayLike<number> | number[] }>;
  /** Legacy: shared x for all series */
  x?: ArrayLike<number> | number[];
  /** Legacy: y arrays when using shared x */
  ys?: (ArrayLike<number> | number[])[];
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
  const n = x.length;
  if (n === 0) return { x: NaN, y: NaN };
  if (xTarget <= x[0]) return { x: Number(x[0]), y: Number(y[0]) };
  if (xTarget >= x[n - 1]) return { x: Number(x[n - 1]), y: Number(y[n - 1]) };

  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (x[mid] <= xTarget) lo = mid;
    else hi = mid;
  }
  const x0 = Number(x[lo]);
  const x1 = Number(x[hi]);
  const dist0 = Math.abs(xTarget - x0);
  const dist1 = Math.abs(xTarget - x1);
  const idx = dist0 <= dist1 ? lo : hi;
  return { x: Number(x[idx]), y: Number(y[idx]) };
}

function getSeriesXy(
  chartData: ChartDataLike,
  seriesIndex: number
): { x: ArrayLike<number>; y: ArrayLike<number> } | null {
  if (chartData.lines) {
    const line = chartData.lines[seriesIndex];
    if (!line) return null;
    return { x: line.x, y: line.y };
  }
  if (chartData.x && chartData.ys) {
    const yValues = chartData.ys[seriesIndex];
    if (!yValues) return null;
    return { x: chartData.x, y: yValues };
  }
  return null;
}

/**
 * Gets the nearest (x, y) point for a given xValue and series index.
 * Reusable across multiple charts - pass any chart data that has lines or x/ys.
 */
export function getNearestPointAtX(
  chartData: ChartDataLike,
  xValue: number,
  seriesIndex: number
): { x: number; y: number } | null {
  const xy = getSeriesXy(chartData, seriesIndex);
  if (!xy) return null;
  return findNearestPoint(xy.x, xy.y, xValue);
}

/**
 * Gets the interpolated (x, y) on the line at xValue.
 * When xValue is between two data points, linearly interpolates y.
 */
export function getInterpolatedPointAtX(
  chartData: ChartDataLike,
  xValue: number,
  seriesIndex: number
): { x: number; y: number } | null {
  const xy = getSeriesXy(chartData, seriesIndex);
  if (!xy) return null;
  const x = xy.x;
  const yValues = xy.y;
  const n = x.length;
  if (n === 0) return null;
  if (xValue <= x[0]) return { x: Number(x[0]), y: Number(yValues[0]) };
  if (xValue >= x[n - 1]) return { x: Number(x[n - 1]), y: Number(yValues[n - 1]) };

  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (x[mid] <= xValue) lo = mid;
    else hi = mid;
  }
  const x0 = Number(x[lo]);
  const x1 = Number(x[hi]);
  const y0 = Number(yValues[lo]);
  const y1 = Number(yValues[hi]);
  const t = x1 === x0 ? 0 : (xValue - x0) / (x1 - x0);
  const y = y0 + t * (y1 - y0);
  return { x: xValue, y };
}
