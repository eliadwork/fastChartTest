import {
  BoxAnnotation,
  ECoordinateMode,
  EHorizontalAnchorPoint,
  EModifierMouseArgKey,
  EResamplingMode,
  FastLineRenderableSeries,
  HorizontalLineAnnotation,
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
import type { ChartOptions, ModifierKey } from '../../types'
import type { ConvertedData, ConvertedSeries } from '../../convert'
import { convertShapes, dashToStrokeArray, normalizeShape } from '../../convert'
import { AxisStretchModifier } from '../modifiers/AxisStretchModifier'
import { LeftClickRubberBandXyZoomModifier } from '../modifiers/LeftClickRubberBandXyZoomModifier'
import { PointMarkModifier } from '../modifiers/PointMarkModifier'
import { ShiftLeftClickZoomPanModifier } from '../modifiers/ShiftLeftClickZoomPanModifier'
import { ZoomHistoryModifier } from '../modifiers/ZoomHistoryModifier'
import { LeftClickZoomPanModifier } from '../modifiers/LeftClickZoomPanModifier'
import { Legend } from '../components/Legend'
import { PointMarkersSync } from '../hooks/usePointMarkersSync'
import { SeriesVisibilitySync } from '../hooks/useSeriesVisibilitySync'
import { ZoomResetSync } from '../hooks/useZoomResetSync'
import { DEFAULT_LEGEND_BACKGROUND_COLOR } from '../defaults'

import { SciChartContainer, SciChartSurfaceStyle } from './SciChartWrapperStyled'
import {
  SCI_CHART_DEFAULT_SERIES_COLORS,
  SCI_CHART_DEFAULT_STROKE_THICKNESS,
  SCI_CHART_DEFAULT_ROLLOVER_STROKE,
  SCI_CHART_DEFAULT_ROLLOVER_DASH,
  SCI_CHART_DEFAULT_POINT_MARK_ICON,
  SCI_CHART_DEFAULT_POINT_MARK_COLOR,
  SCI_CHART_DEFAULT_AXIS_LABEL_COLOR,
  SCI_CHART_DEFAULT_ZERO_LINE_COLOR,
  SCI_CHART_ZERO_LINE_STROKE_THICKNESS,
  SCI_CHART_SHAPE_STROKE_THICKNESS,
  SCI_CHART_BOX_FILL_OPACITY_SUFFIX,
  SCI_CHART_RESAMPLING_PRECISION_DEFAULT,
  SCI_CHART_RESAMPLING_PRECISION_OFF,
  SCI_CHART_VISIBLE_RANGE_PAD_FACTOR,
  SCI_CHART_BOX_DEFAULT_X1,
  SCI_CHART_BOX_DEFAULT_X2,
  SCI_CHART_BOX_DEFAULT_Y1,
  SCI_CHART_BOX_DEFAULT_Y2,
  SCI_CHART_STRETCH_SENSITIVITY,
  SCI_CHART_POINT_MARK_ICON_SIZE_DEFAULT,
  SCI_CHART_BOX_LABEL_FONT_SIZE,
  SCI_CHART_DEFAULT_TEXT_COLOR,
} from './sciChartWrapperConstants'

const MODIFIER_KEY_MAP: { [K in ModifierKey]?: EModifierMouseArgKey } = {
  Shift: EModifierMouseArgKey.Shift,
  Ctrl: EModifierMouseArgKey.Ctrl,
  Alt: EModifierMouseArgKey.Alt,
}

export interface SciChartSurfaceRendererProps {
  data: ConvertedData
  options: ChartOptions
  chartId?: string
  overlaySlot?: React.ReactNode
}

export const SciChartSurfaceRenderer = ({
  data,
  options,
  chartId,
  overlaySlot,
}: SciChartSurfaceRendererProps) => {
  const { lines: lineShapes, boxes } = convertShapes(options.shapes)

  const stretchEnable = options.stretchEnable !== false
  const stretchTrigger = options.stretchTrigger ?? 'rightClick'
  const stretchOnRightClick = stretchTrigger === 'rightClick'
  const stretchKey = stretchOnRightClick ? undefined : MODIFIER_KEY_MAP[stretchTrigger as ModifierKey]

  const panEnable = options.panEnable !== false
  const panTrigger = options.panTrigger ?? options.panKey ?? 'Shift'
  const panOnLeftClick = panTrigger === 'leftClick'
  const panOnShift = panTrigger === 'Shift'
  const panKey = panOnLeftClick ? undefined : MODIFIER_KEY_MAP[panTrigger as ModifierKey]

  const seriesColors = options.defaultSeriesColors ?? [...SCI_CHART_DEFAULT_SERIES_COLORS]
  const strokeThickness = options.defaultStrokeThickness ?? SCI_CHART_DEFAULT_STROKE_THICKNESS

  const rolloverShow = options.rolloverShow !== false
  const rolloverStroke = options.rolloverStroke ?? SCI_CHART_DEFAULT_ROLLOVER_STROKE
  const rolloverDash = dashToStrokeArray(options.rolloverDash) ?? SCI_CHART_DEFAULT_ROLLOVER_DASH

  const resamplingMode = options.resampling !== false ? EResamplingMode.Auto : EResamplingMode.None
  const resamplingPrecision =
    options.resamplingPrecision ??
    (options.resampling ? SCI_CHART_RESAMPLING_PRECISION_DEFAULT : SCI_CHART_RESAMPLING_PRECISION_OFF)

  const pointMarkIcon = options.pointMarkIcon ?? SCI_CHART_DEFAULT_POINT_MARK_ICON
  const pointMarkIconColor = options.pointMarkIconColor ?? SCI_CHART_DEFAULT_POINT_MARK_COLOR
  const onPointMark = options.onPointMark
    ? (xValue: number, yValue: number, context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }) => {
        const contextWithBindable = {
          ...context,
          getSeriesVisibility: context?.getSeriesVisibility ?? (() => [] as boolean[]),
          seriesBindable: context?.seriesBindable ?? data.seriesBindable,
        }
        const result = options.onPointMark!(xValue, yValue, contextWithBindable)
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
    <SciChartContainer>
      <SciChartReact
        style={SciChartSurfaceStyle}
        initChart={async (rootElement) => {
          const createOptions = options.backgroundColor != null ? { background: options.backgroundColor } : undefined
          const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, createOptions)

          const axisLabelColor = options.textColor ?? SCI_CHART_DEFAULT_AXIS_LABEL_COLOR
          const axisOptions = { labelStyle: { color: axisLabelColor } }
          const xAxis = new NumericAxis(wasmContext, axisOptions)
          const yAxis = new NumericAxis(wasmContext, axisOptions)
          sciChartSurface.xAxes.add(xAxis)
          sciChartSurface.yAxes.add(yAxis)

          let xMin = Infinity
          let xMax = -Infinity
          let yMin = Infinity
          let yMax = -Infinity
          for (const series of data.series) {
            for (let index = 0; index < series.x.length; index++) {
              const value = series.x[index]
              if (Number.isFinite(value)) {
                if (value < xMin) xMin = value
                if (value > xMax) xMax = value
              }
            }
            for (let index = 0; index < series.y.length; index++) {
              const value = series.y[index]
              if (Number.isFinite(value)) {
                if (value < yMin) yMin = value
                if (value > yMax) yMax = value
              }
            }
          }

          if (options.clipZoomToData !== false && Number.isFinite(xMin)) {
            const pad = (number: number) =>
              number === 0 ? 1 : Math.abs(number) * SCI_CHART_VISIBLE_RANGE_PAD_FACTOR
            xAxis.visibleRangeLimit = new NumberRange(xMin - pad(xMin), xMax + pad(xMax))
            if (Number.isFinite(yMin) && Number.isFinite(yMax)) {
              yAxis.visibleRangeLimit = new NumberRange(yMin - pad(yMin), yMax + pad(yMax))
            }
          }

          for (let index = 0; index < data.series.length; index++) {
            const line = data.series[index]
            const dataSeries = new XyDataSeries(wasmContext, {
              xValues: line.x,
              yValues: line.y,
              isSorted: true,
              containsNaN: false,
              dataSeriesName: line.name,
            })

            const lineStyle = line.style
            const isVisible = data.seriesVisibility?.[index] ?? true
            const strokeColor = lineStyle.color ?? seriesColors[index % seriesColors.length]
            const strokeDashArray = dashToStrokeArray(lineStyle.dash)
            const series = new FastLineRenderableSeries(wasmContext, {
              dataSeries,
              stroke: strokeColor,
              strokeThickness: lineStyle.thickness ?? strokeThickness,
              strokeDashArray,
              resamplingMode,
              resamplingPrecision,
              isVisible,
            })

            sciChartSurface.renderableSeries.add(series)
          }

          const zeroLineColor = options.zeroLineColor ?? SCI_CHART_DEFAULT_ZERO_LINE_COLOR
          sciChartSurface.annotations.add(
            new VerticalLineAnnotation({
              x1: 0,
              stroke: zeroLineColor,
              strokeThickness: SCI_CHART_ZERO_LINE_STROKE_THICKNESS,
            })
          )
          sciChartSurface.annotations.add(
            new HorizontalLineAnnotation({
              y1: 0,
              stroke: zeroLineColor,
              strokeThickness: SCI_CHART_ZERO_LINE_STROKE_THICKNESS,
            })
          )

          for (const shape of lineShapes) {
            if (shape.lineAxis === 'x') {
              sciChartSurface.annotations.add(
                new VerticalLineAnnotation({
                  x1: shape.lineValue,
                  stroke: shape.color,
                  strokeThickness: SCI_CHART_SHAPE_STROKE_THICKNESS,
                  strokeDashArray: shape.strokeDashArray,
                })
              )
            } else {
              sciChartSurface.annotations.add(
                new HorizontalLineAnnotation({
                  y1: shape.lineValue,
                  stroke: shape.color,
                  strokeThickness: SCI_CHART_SHAPE_STROKE_THICKNESS,
                  strokeDashArray: shape.strokeDashArray,
                })
              )
            }
          }

          const hasDataBounds = Number.isFinite(xMin) && Number.isFinite(yMin)
          for (const box of boxes) {
            const bx1 = box.x1 ?? (hasDataBounds ? xMin : SCI_CHART_BOX_DEFAULT_X1)
            const bx2 = box.x2 ?? (hasDataBounds ? xMax : SCI_CHART_BOX_DEFAULT_X2)
            const by1 = box.y1 ?? (hasDataBounds ? yMin : SCI_CHART_BOX_DEFAULT_Y1)
            const by2 = box.y2 ?? (hasDataBounds ? yMax : SCI_CHART_BOX_DEFAULT_Y2)
            const useRelativeX = box.x1 == null && box.x2 == null && !hasDataBounds
            const useRelativeY = box.y1 == null && box.y2 == null && !hasDataBounds
            sciChartSurface.annotations.add(
              new BoxAnnotation({
                x1: useRelativeX ? SCI_CHART_BOX_DEFAULT_X1 : bx1,
                x2: useRelativeX ? SCI_CHART_BOX_DEFAULT_X2 : bx2,
                y1: useRelativeY ? SCI_CHART_BOX_DEFAULT_Y1 : by1,
                y2: useRelativeY ? SCI_CHART_BOX_DEFAULT_Y2 : by2,
                xCoordinateMode: useRelativeX ? ECoordinateMode.Relative : ECoordinateMode.DataValue,
                yCoordinateMode: useRelativeY ? ECoordinateMode.Relative : ECoordinateMode.DataValue,
                fill: box.fill ?? box.color + SCI_CHART_BOX_FILL_OPACITY_SUFFIX,
                stroke: box.color,
                strokeThickness: SCI_CHART_SHAPE_STROKE_THICKNESS,
              })
            )
            if (box.name) {
              const labelX = box.x1 ?? (hasDataBounds ? xMin : undefined)
              const labelY = box.y2 ?? box.y1 ?? (hasDataBounds ? yMax : undefined)
              sciChartSurface.annotations.add(
                new NativeTextAnnotation({
                  x1: labelX ?? SCI_CHART_BOX_DEFAULT_X1,
                  y1: labelY ?? SCI_CHART_BOX_DEFAULT_Y2,
                  xCoordinateMode: labelX != null ? ECoordinateMode.DataValue : ECoordinateMode.Relative,
                  yCoordinateMode: labelY != null ? ECoordinateMode.DataValue : ECoordinateMode.Relative,
                  text: box.name,
                  textColor: box.color,
                  fontSize: SCI_CHART_BOX_LABEL_FONT_SIZE,
                  horizontalAnchorPoint: EHorizontalAnchorPoint.Left,
                })
              )
            }
          }

          const modifiers: InstanceType<typeof import('scichart').ChartModifierBase2D>[] = [
            new PointMarkModifier({
              onPointMark,
              iconSize: options.pointMarkIconSize ?? SCI_CHART_POINT_MARK_ICON_SIZE_DEFAULT,
              chartId: chartId ?? undefined,
              onRegisterForClear: options.pointMarkRegisterForClear,
            }),
            new ZoomHistoryModifier({ chartId }),
            new LeftClickRubberBandXyZoomModifier({ executeCondition: { key: EModifierMouseArgKey.None } }),
          ]
          if (stretchEnable) {
            modifiers.push(
              new AxisStretchModifier({
                executeOnRightClick: stretchOnRightClick,
                executeCondition: stretchKey != null ? { key: stretchKey } : undefined,
                sensitivity: SCI_CHART_STRETCH_SENSITIVITY,
              })
            )
          }
          if (panEnable) {
            modifiers.push(
              new (panOnShift ? ShiftLeftClickZoomPanModifier : panOnLeftClick ? LeftClickZoomPanModifier : ZoomPanModifier)(
                {
                  executeCondition: {
                    key: panOnShift ? EModifierMouseArgKey.Shift : panKey ?? EModifierMouseArgKey.None,
                  },
                }
              )
            )
          }
          modifiers.push(new MouseWheelZoomModifier(), new ZoomExtentsModifier())
          if (rolloverShow) {
            modifiers.push(
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
          }
          for (const modifier of modifiers) {
            sciChartSurface.chartModifiers.add(modifier)
          }

          return { sciChartSurface }
        }}
      >
        <ZoomResetSync chartId={chartId} />
        <PointMarkersSync
          icons={options.icons ?? []}
          defaultIcon={pointMarkIcon}
          defaultColor={pointMarkIconColor}
          iconSize={options.pointMarkIconSize ?? SCI_CHART_POINT_MARK_ICON_SIZE_DEFAULT}
        />
        <SeriesVisibilitySync seriesVisibility={options.seriesVisibility} />
        {!options.chartOnly &&
          (overlaySlot ?? (
            <Legend
              backgroundColor={
                options.legendBackgroundColor ?? options.backgroundColor ?? DEFAULT_LEGEND_BACKGROUND_COLOR
              }
              textColor={options.textColor ?? SCI_CHART_DEFAULT_TEXT_COLOR}
              seriesVisibility={options.seriesVisibility}
              seriesGroupKeys={data.series.map((series: ConvertedSeries) => series.lineGroupKey)}
              onSeriesVisibilityChange={options.onSeriesVisibilityChange}
              onSeriesVisibilityGroupChange={options.onSeriesVisibilityGroupChange}
            />
          ))}
      </SciChartReact>
    </SciChartContainer>
  )
}
