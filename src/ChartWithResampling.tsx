import {
  EModifierMouseArgKey,
  ELegendPlacement,
  EResamplingMode,
  FastLineRenderableSeries,
  HorizontalLineAnnotation,
  LegendModifier,
  MouseWheelZoomModifier,
  NumericAxis,
  RolloverModifier,
  RubberBandXyZoomModifier,
  SciChartSurface,
  VerticalLineAnnotation,
  XyDataSeries,
  ZoomExtentsModifier,
  ZoomPanModifier,
} from 'scichart'
import { AxisStretchModifier } from './AxisStretchModifier'
import { ZoomHistoryModifier } from './ZoomHistoryModifier'
import { SciChartReact } from 'scichart-react'

export interface ChartData {
  x: Float64Array
  ys: Float64Array[]
  seriesNames?: string[]
}

export interface ChartShape {
  color: string
  lineAxis: 'x' | 'y'
  lineValue: number
}

interface ChartWithResamplingProps {
  data: ChartData
  resamplingMode: EResamplingMode
  resamplingPrecision: number
  style?: React.CSSProperties
  shapes?: ChartShape[]
  /** Key to hold for axis stretch (box zoom is default drag) */
  stretchModifierKey?: 'Shift' | 'Ctrl' | 'Alt'
  rolloverLineStroke?: string
  rolloverLineStrokeDashArray?: number[]
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

const MODIFIER_KEY_MAP = {
  Shift: EModifierMouseArgKey.Shift,
  Ctrl: EModifierMouseArgKey.Ctrl,
  Alt: EModifierMouseArgKey.Alt,
} as const

export function ChartWithResampling({
  data,
  resamplingMode,
  resamplingPrecision,
  style = { width: '100%', height: '100%' },
  shapes = [],
  stretchModifierKey = 'Shift',
  rolloverLineStroke = '#FF0000',
  rolloverLineStrokeDashArray = [8, 4],
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

        const seriesNames = data.seriesNames ?? data.ys.map((_, i) => `Series ${i}`)
        for (let i = 0; i < data.ys.length; i++) {
          const dataSeries = new XyDataSeries(wasmContext, {
            xValues: data.x,
            yValues: data.ys[i],
            isSorted: true,
            containsNaN: false,
            dataSeriesName: seriesNames[i] ?? `Series ${i}`,
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

        for (const shape of shapes) {
          if (shape.lineAxis === 'x') {
            sciChartSurface.annotations.add(
              new VerticalLineAnnotation({
                x1: shape.lineValue,
                stroke: shape.color,
                strokeThickness: 2,
              })
            )
          } else {
            sciChartSurface.annotations.add(
              new HorizontalLineAnnotation({
                y1: shape.lineValue,
                stroke: shape.color,
                strokeThickness: 2,
              })
            )
          }
        }

        const stretchKey = MODIFIER_KEY_MAP[stretchModifierKey]
        sciChartSurface.chartModifiers.add(
          new ZoomHistoryModifier(),
          new RubberBandXyZoomModifier({
            executeCondition: { key: EModifierMouseArgKey.None },
          }),
          new AxisStretchModifier({
            executeCondition: { key: stretchKey },
            sensitivity: 0.5,
          }),
          new ZoomPanModifier({
            executeCondition: { key: EModifierMouseArgKey.Ctrl },
          }),
          new MouseWheelZoomModifier(),
          new ZoomExtentsModifier(),
          new LegendModifier({
            showSeriesMarkers: true,
            showCheckboxes: false,
            placement: ELegendPlacement.TopLeft,
          }),
          new RolloverModifier({
            tooltipDataTemplate: (seriesInfo) => [
              `${seriesInfo.seriesName}:`,
              `X: ${seriesInfo.formattedXValue}`,
              `Y: ${seriesInfo.formattedYValue}`,
            ],
            rolloverLineStroke,
            rolloverLineStrokeDashArray,
          })
        )

        return { sciChartSurface }
      }}
    />
  )
}
