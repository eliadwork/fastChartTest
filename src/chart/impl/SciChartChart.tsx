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
import { SciChartReact } from 'scichart-react'
import type { ChartOptions, ModifierKey } from '../types'
import type { ConvertedData, ConvertedShape } from '../convert'
import { convertShapes, normalizeShape } from '../convert'
import { AxisStretchModifier } from './AxisStretchModifier'
import { PointMarkModifier } from './PointMarkModifier'
import { ZoomHistoryModifier } from './ZoomHistoryModifier'

const DEFAULT_SERIES_COLORS = [
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

const MODIFIER_KEY_MAP: Record<ModifierKey, EModifierMouseArgKey> = {
  Shift: EModifierMouseArgKey.Shift,
  Ctrl: EModifierMouseArgKey.Ctrl,
  Alt: EModifierMouseArgKey.Alt,
}

export interface SciChartChartProps {
  data: ConvertedData
  options: ChartOptions
  style?: React.CSSProperties
}

export function SciChartChart({ data, options, style }: SciChartChartProps) {
  const shapes = convertShapes(options.shapes)
  const stretchKey = MODIFIER_KEY_MAP[options.stretchKey ?? 'Shift']
  const panKey = EModifierMouseArgKey.Ctrl
  const seriesColors = options.defaultSeriesColors ?? DEFAULT_SERIES_COLORS
  const strokeThickness = options.defaultStrokeThickness ?? 2
  const rolloverStroke = options.rolloverStroke ?? '#FF0000'
  const rolloverDash = options.rolloverDash ?? [8, 4]
  const resamplingMode = options.resampling !== false ? EResamplingMode.Auto : EResamplingMode.None
  const resamplingPrecision = options.resamplingPrecision ?? (options.resampling ? 1 : 0)

  const onPointMark = options.onPointMark
    ? (xValue: number) => {
        const result = options.onPointMark!(xValue)
        if (!result) return null
        const arr = Array.isArray(result) ? result : [result]
        return arr.map(normalizeShape) as ConvertedShape[]
      }
    : undefined

  return (
    <SciChartReact
      style={style}
      initChart={async (rootElement) => {
        const createOptions = options.backgroundColor != null ? { background: options.backgroundColor } : undefined
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, createOptions)

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

          const lineStyle = data.seriesLines?.[i]
          const isVisible = data.seriesVisibility?.[i] ?? true
          const strokeColor =
            lineStyle?.color ?? data.seriesColors?.[i] ?? seriesColors[i % seriesColors.length]
          const series = new FastLineRenderableSeries(wasmContext, {
            dataSeries,
            stroke: strokeColor,
            strokeThickness: lineStyle?.thickness ?? strokeThickness,
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
            executeCondition: { key: panKey },
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
            rolloverLineStroke: rolloverStroke,
            rolloverLineStrokeDashArray: rolloverDash,
          })
        )

        return { sciChartSurface }
      }}
    />
  )
}
