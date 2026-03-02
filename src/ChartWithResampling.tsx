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
import { PointMarkModifier } from './PointMarkModifier'
import { ZoomHistoryModifier } from './ZoomHistoryModifier'
import { SciChartReact } from 'scichart-react'

export interface ChartLineStyle {
  color?: string
  thickness?: number
  dash?: number[]
}

export interface ChartData {
  x: Float64Array
  ys: Float64Array[]
  seriesNames?: string[]
  seriesColors?: string[]
  /** Per-series visibility: true = show, false = hide. Undefined = show. */
  seriesVisibility?: boolean[]
  /** Per-series line styling. Injected from outside. */
  seriesLines?: ChartLineStyle[]
}

export interface ChartShape {
  color: string
  lineAxis: 'x' | 'y'
  lineValue: number
  /** Dash pattern for line, e.g. [8, 4] for dashed. Omit for solid. */
  strokeDashArray?: number[]
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
  /** Chart background color (HTML color code) */
  backgroundColor?: string
  /** Optional: called on chart click with x value. Handler returns shape(s) to inject. */
  onPointMark?: (xValue: number) => ChartShape | ChartShape[] | null
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
  backgroundColor,
  onPointMark,
}: ChartWithResamplingProps) {
  return (
    <SciChartReact
      style={style}
      initChart={async (rootElement) => {
        const createOptions = backgroundColor != null ? { background: backgroundColor } : undefined
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, createOptions)

        const xAxis = new NumericAxis(wasmContext)
        const yAxis = new NumericAxis(wasmContext)
        sciChartSurface.xAxes.add(xAxis)
        sciChartSurface.yAxes.add(yAxis)

        const seriesNames = data.seriesNames ?? data.ys.map((_, i) => `Series ${i}`)
        const seriesVisibility = data.seriesVisibility
        const seriesLines = data.seriesLines
        const seriesColors = data.seriesColors
        for (let i = 0; i < data.ys.length; i++) {
          const dataSeries = new XyDataSeries(wasmContext, {
            xValues: data.x,
            yValues: data.ys[i],
            isSorted: true,
            containsNaN: false,
            dataSeriesName: seriesNames[i] ?? `Series ${i}`,
          })

          const lineStyle = seriesLines?.[i]
          const isVisible = seriesVisibility?.[i] ?? true
          const strokeColor =
            lineStyle?.color ?? seriesColors?.[i] ?? SERIES_COLORS[i % SERIES_COLORS.length]
          const series = new FastLineRenderableSeries(wasmContext, {
            dataSeries,
            stroke: strokeColor,
            strokeThickness: lineStyle?.thickness ?? 2,
            strokeDashArray: lineStyle?.dash,
            resamplingMode,
            resamplingPrecision,
            isVisible,
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
                strokeDashArray: shape.strokeDashArray,
              })
            )
          } else {
            sciChartSurface.annotations.add(
              new HorizontalLineAnnotation({
                y1: shape.lineValue,
                stroke: shape.color,
                strokeThickness: 2,
                strokeDashArray: shape.strokeDashArray,
              })
            )
          }
        }

        const stretchKey = MODIFIER_KEY_MAP[stretchModifierKey]
        sciChartSurface.chartModifiers.add(
          new PointMarkModifier({ onPointMark }),
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
            showCheckboxes: true,
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
