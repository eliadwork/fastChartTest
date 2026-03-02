import type {
  ChartWrapperProps,
  GenericChartData,
  GenericChartOptions,
  GenericChartShape,
} from './chartTypes'
import { toFloat64Array } from './chartTypes'
import { ChartWithResampling } from './ChartWithResampling'
import type { ChartData, ChartShape } from './ChartWithResampling'
import { EResamplingMode } from 'scichart'

function convertToSciChartData(data: GenericChartData): ChartData {
  const x = toFloat64Array(data.x)
  const series = data.series ?? data.ys ?? []
  const ys = series.map((s) => toFloat64Array(s))
  return { x, ys }
}

function convertToSciChartShapes(shapes: GenericChartShape[] = []): ChartShape[] {
  return shapes.map((s) => ({
    color: s.color,
    lineAxis: s.axis,
    lineValue: s.value,
  }))
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
}: ChartWrapperProps) {
  const chartData = convertToSciChartData(data)

  switch (library) {
    case 'scichart':
      return <SciChartImplementation data={chartData} options={options} style={style} />
    default:
      return <SciChartImplementation data={chartData} options={options} style={style} />
  }
}
