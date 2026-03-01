import {
  EResamplingMode,
  FastLineRenderableSeries,
  MouseWheelZoomModifier,
  NumericAxis,
  SciChartSurface,
  XyDataSeries,
  ZoomExtentsModifier,
  ZoomPanModifier,
} from 'scichart'
import { SciChartReact } from 'scichart-react'

export interface ChartData {
  x: Float64Array
  ys: Float64Array[]
}

interface ChartWithResamplingProps {
  data: ChartData
  resamplingMode: EResamplingMode
  resamplingPrecision: number
  style?: React.CSSProperties
}

const SERIES_COLORS = [
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
]

export function ChartWithResampling({
  data,
  resamplingMode,
  resamplingPrecision,
  style = { width: '100%', height: '100%' },
}: ChartWithResamplingProps) {
  return (
    <SciChartReact
      style={style}
      initChart={async (rootElement) => {
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement)

        const xAxis = new NumericAxis(wasmContext)
        const yAxis = new NumericAxis(wasmContext)
        sciChartSurface.xAxes.add(xAxis)
        sciChartSurface.yAxes.add(yAxis)

        for (let i = 0; i < data.ys.length; i++) {
          const dataSeries = new XyDataSeries(wasmContext, {
            xValues: data.x,
            yValues: data.ys[i],
            isSorted: true,
            containsNaN: false,
          })

          const series = new FastLineRenderableSeries(wasmContext, {
            dataSeries,
            stroke: SERIES_COLORS[i % SERIES_COLORS.length],
            strokeThickness: 2,
            resamplingMode,
            resamplingPrecision,
          })

          sciChartSurface.renderableSeries.add(series)
        }

        sciChartSurface.chartModifiers.add(
          new ZoomPanModifier(),
          new MouseWheelZoomModifier(),
          new ZoomExtentsModifier()
        )

        return { sciChartSurface }
      }}
    />
  )
}
