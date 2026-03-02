import {
  BoxAnnotation,
  ECoordinateMode,
  EHorizontalAnchorPoint,
  EModifierMouseArgKey,
  ELegendPlacement,
  EResamplingMode,
  FastLineRenderableSeries,
  HorizontalLineAnnotation,
  LegendModifier,
  MouseWheelZoomModifier,
  NativeTextAnnotation,
  NumberRange,
  NumericAxis,
  RolloverModifier,
  SciChartSurface,
  VerticalLineAnnotation,
  XyDataSeries,
  ZoomExtentsModifier,
  ZoomPanModifier,
} from 'scichart'
import { SciChartReact } from 'scichart-react'
import type { ChartOptions, ModifierKey } from '../types'
import type { ConvertedData } from '../convert'
import { convertShapes, normalizeShape } from '../convert'
import { AxisStretchModifier } from './AxisStretchModifier'
import { LeftClickRubberBandXyZoomModifier } from './LeftClickRubberBandXyZoomModifier'
import { PointMarkersSync } from './PointMarkersSync'
import { SeriesVisibilitySync } from './SeriesVisibilitySync'
import { LeftClickZoomPanModifier } from './LeftClickZoomPanModifier'
import { PointMarkModifier } from './PointMarkModifier'
import { ShiftLeftClickZoomPanModifier } from './ShiftLeftClickZoomPanModifier'
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
  const { lines: lineShapes, boxes } = convertShapes(options.shapes)
  const stretchTrigger = options.stretchTrigger ?? 'Ctrl'
  const stretchOnRightClick = stretchTrigger === 'rightClick'
  const stretchKey = stretchOnRightClick ? undefined : MODIFIER_KEY_MAP[stretchTrigger as ModifierKey]
  const panTrigger = options.panTrigger ?? options.panKey ?? 'Shift'
  const panOnLeftClick = panTrigger === 'leftClick'
  const panOnShift = panTrigger === 'Shift'
  const panKey = panOnLeftClick ? undefined : MODIFIER_KEY_MAP[panTrigger as ModifierKey]
  const seriesColors = options.defaultSeriesColors ?? DEFAULT_SERIES_COLORS
  const strokeThickness = options.defaultStrokeThickness ?? 2
  const rolloverStroke = options.rolloverStroke ?? '#FF0000'
  const rolloverDash = options.rolloverDash ?? [8, 4]
  const resamplingMode = options.resampling !== false ? EResamplingMode.Auto : EResamplingMode.None
  const resamplingPrecision = options.resamplingPrecision ?? (options.resampling ? 1 : 0)

  const pointMarkIcon = options.pointMarkIcon ?? '📍'
  const pointMarkIconColor = options.pointMarkIconColor ?? '#3388ff'
  const onPointMark = options.onPointMark
    ? (xValue: number, yValue: number) => {
        const result = options.onPointMark!(xValue, yValue)
        if (!result) return null
        const arr = Array.isArray(result) ? result : [result]
        return arr.map((item) => {
          if ('type' in item && item.type === 'marker') {
            return {
              ...item,
              icon: item.icon ?? pointMarkIcon,
              color: item.color ?? pointMarkIconColor,
            }
          }
          return normalizeShape(item as Parameters<typeof normalizeShape>[0])
        })
      }
    : undefined

  return (
    <SciChartReact
      style={style}
      initChart={async (rootElement) => {
        const createOptions = options.backgroundColor != null ? { background: options.backgroundColor } : undefined
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, createOptions)

        const axisLabelColor = options.textColor ?? '#ffffff'
        const axisOptions = { labelStyle: { color: axisLabelColor } }
        const xAxis = new NumericAxis(wasmContext, axisOptions)
        const yAxis = new NumericAxis(wasmContext, axisOptions)
        sciChartSurface.xAxes.add(xAxis)
        sciChartSurface.yAxes.add(yAxis)

        let xMin = Infinity
        let xMax = -Infinity
        let yMin = Infinity
        let yMax = -Infinity
        if (data.x.length > 0 && data.ys.length > 0) {
          for (let i = 0; i < data.x.length; i++) {
            const v = data.x[i]
            if (v < xMin) xMin = v
            if (v > xMax) xMax = v
          }
          for (const yArr of data.ys) {
            for (let i = 0; i < yArr.length; i++) {
              const v = yArr[i]
              if (Number.isFinite(v)) {
                if (v < yMin) yMin = v
                if (v > yMax) yMax = v
              }
            }
          }
        }

        if (options.clipZoomToData !== false && Number.isFinite(xMin)) {
          const pad = (n: number) => (n === 0 ? 1 : Math.abs(n) * 1e-6)
          xAxis.visibleRangeLimit = new NumberRange(
            xMin - pad(xMin),
            xMax + pad(xMax)
          )
          if (Number.isFinite(yMin) && Number.isFinite(yMax)) {
            yAxis.visibleRangeLimit = new NumberRange(
              yMin - pad(yMin),
              yMax + pad(yMax)
            )
          }
        }

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
          const strokeDashArray =
            lineStyle?.dash ?? (lineStyle?.striped ? [6, 4] : undefined)
          const series = new FastLineRenderableSeries(wasmContext, {
            dataSeries,
            stroke: strokeColor,
            strokeThickness: lineStyle?.thickness ?? strokeThickness,
            strokeDashArray,
            resamplingMode,
            resamplingPrecision,
            isVisible,
          })

          sciChartSurface.renderableSeries.add(series)
        }

        for (const shape of lineShapes) {
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

        const hasDataBounds = Number.isFinite(xMin) && Number.isFinite(yMin)
        for (const box of boxes) {
          const bx1 = box.x1 ?? (hasDataBounds ? xMin : 0)
          const bx2 = box.x2 ?? (hasDataBounds ? xMax : 1)
          const by1 = box.y1 ?? (hasDataBounds ? yMin : 0)
          const by2 = box.y2 ?? (hasDataBounds ? yMax : 1)
          const useRelativeX = box.x1 == null && box.x2 == null && !hasDataBounds
          const useRelativeY = box.y1 == null && box.y2 == null && !hasDataBounds
          sciChartSurface.annotations.add(
            new BoxAnnotation({
              x1: useRelativeX ? 0 : bx1,
              x2: useRelativeX ? 1 : bx2,
              y1: useRelativeY ? 0 : by1,
              y2: useRelativeY ? 1 : by2,
              xCoordinateMode: useRelativeX ? ECoordinateMode.Relative : ECoordinateMode.DataValue,
              yCoordinateMode: useRelativeY ? ECoordinateMode.Relative : ECoordinateMode.DataValue,
              fill: box.fill ?? box.color + '33',
              stroke: box.color,
              strokeThickness: 2,
            })
          )
          if (box.name) {
            const labelX = box.x1 ?? (hasDataBounds ? xMin : undefined)
            const labelY = box.y2 ?? box.y1 ?? (hasDataBounds ? yMax : undefined)
            sciChartSurface.annotations.add(
              new NativeTextAnnotation({
                x1: labelX ?? 0,
                y1: labelY ?? 1,
                xCoordinateMode: labelX != null ? ECoordinateMode.DataValue : ECoordinateMode.Relative,
                yCoordinateMode: labelY != null ? ECoordinateMode.DataValue : ECoordinateMode.Relative,
                text: box.name,
                textColor: box.color,
                fontSize: 12,
                horizontalAnchorPoint: EHorizontalAnchorPoint.Left,
              })
            )
          }
        }

        sciChartSurface.chartModifiers.add(
          new PointMarkModifier({ onPointMark }),
          new ZoomHistoryModifier(),
          new LeftClickRubberBandXyZoomModifier({
            executeCondition: { key: EModifierMouseArgKey.None },
          }),
          new AxisStretchModifier({
            executeOnRightClick: stretchOnRightClick,
            executeCondition: stretchKey != null ? { key: stretchKey } : undefined,
            sensitivity: 0.5,
          }),
          new (panOnShift
            ? ShiftLeftClickZoomPanModifier
            : panOnLeftClick
              ? LeftClickZoomPanModifier
              : ZoomPanModifier)({
            executeCondition: {
              key: panOnShift ? EModifierMouseArgKey.Shift : panKey ?? EModifierMouseArgKey.None,
            },
          }),
          new MouseWheelZoomModifier(),
          new ZoomExtentsModifier(),
          new LegendModifier({
            showSeriesMarkers: true,
            showCheckboxes: true,
            placement: ELegendPlacement.TopLeft,
            backgroundColor: options.legendBackgroundColor ?? options.backgroundColor,
            textColor: options.textColor ?? '#ffffff',
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
    >
      <PointMarkersSync
        icons={options.icons ?? []}
        pointMarkers={options.pointMarkers ?? []}
        defaultIcon={pointMarkIcon}
        defaultColor={pointMarkIconColor}
      />
      <SeriesVisibilitySync seriesVisibility={options.seriesVisibility} />
    </SciChartReact>
  )
}
