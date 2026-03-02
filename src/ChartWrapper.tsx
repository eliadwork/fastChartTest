import type {
  ChartWrapperProps,
  GenericChartData,
  GenericChartOptions,
  GenericChartShape,
  GenericLineStyle,
} from './chartTypes'
import { toFloat64Array } from './chartTypes'
import { ChartWithResampling } from './ChartWithResampling'
import type { ChartData, ChartShape } from './ChartWithResampling'
import { EResamplingMode } from 'scichart'

function convertToSciChartData(
  data: GenericChartData,
  options?: GenericChartOptions,
  linesProp?: GenericLineStyle[]
): ChartData {
  const x = toFloat64Array(data.x)
  const series = data.series ?? data.ys ?? []
  const ys = series.map((s) => toFloat64Array(s))
  const seriesLines = linesProp ?? options?.seriesLines
  return {
    x,
    ys,
    seriesNames: data.seriesNames,
    seriesColors: data.seriesColors,
    seriesVisibility: options?.seriesVisibility,
    seriesLines,
  }
}

function convertToSciChartShapes(shapes: GenericChartShape[] = []): ChartShape[] {
  return shapes.map((s) => ({
    color: s.color,
    lineAxis: s.axis,
    lineValue: s.value,
    strokeDashArray: s.strokeDashArray,
  }))
}

function convertToChartShape(
  s: GenericChartShape | { color: string; lineAxis: 'x' | 'y'; lineValue: number; strokeDashArray?: number[] }
): ChartShape {
  if ('lineAxis' in s && 'lineValue' in s) {
    return { color: s.color, lineAxis: s.lineAxis, lineValue: s.lineValue, strokeDashArray: s.strokeDashArray }
  }
  const g = s as GenericChartShape
  return { color: g.color, lineAxis: g.axis, lineValue: g.value, strokeDashArray: g.strokeDashArray }
}

function SciChartImplementation({
  data,
  options,
  style,
}: {
  data: ChartData
  options: GenericChartOptions
  style?: React.CSSProperties
}) {
  const shapes = convertToSciChartShapes(options.shapes)
  const resamplingMode = options.resampling !== false ? EResamplingMode.Auto : EResamplingMode.None
  const resamplingPrecision = options.resamplingPrecision ?? (options.resampling ? 1 : 0)

  return (
    <ChartWithResampling
      data={data}
      resamplingMode={resamplingMode}
      resamplingPrecision={resamplingPrecision}
      style={style}
      shapes={shapes}
      stretchModifierKey={options.stretchModifierKey}
      rolloverLineStroke={options.rolloverLineStroke}
      rolloverLineStrokeDashArray={options.rolloverLineStrokeDashArray}
      backgroundColor={options.backgroundColor}
      onPointMark={
        options.onPointMark
          ? (xValue) => {
              const result = options.onPointMark!(xValue)
              if (!result) return null
              const arr = Array.isArray(result) ? result : [result]
              return arr.map(convertToChartShape) as ChartShape[]
            }
          : undefined
      }
    />
  )
}

/**
 * Generic chart wrapper - library-agnostic interface.
 * Converts generic data/options to the active chart implementation.
 * Swap library via the `library` prop (e.g. future: 'uplot').
 */
export function ChartWrapper({
  data,
  options = {},
  library = 'scichart',
  style = { width: '100%', height: '100%' },
  lines,
}: ChartWrapperProps) {
  const chartData = convertToSciChartData(data, options, lines)

  switch (library) {
    case 'scichart':
      return <SciChartImplementation data={chartData} options={options} style={style} />
    default:
      return <SciChartImplementation data={chartData} options={options} style={style} />
  }
}
