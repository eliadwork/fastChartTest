import { useMemo } from 'react'
import {
  EModifierMouseArgKey,
  EResamplingMode,
  FastLineRenderableSeries,
  HorizontalLineAnnotation,
  MouseWheelZoomModifier,
  NumberRange,
  NumericAxis,
  RolloverModifier,
  SciChartSurface,
  VerticalLineAnnotation,
  XyDataSeries,
  ZoomExtentsModifier,
  ZoomPanModifier,
} from 'scichart'
import type { ChartOptions, ModifierKey } from '../../../types'
import type { ConvertedData } from '../convert'
import { convertShapes, dashToStrokeArray } from '../convert'
import { AxisStretchModifier } from '../modifiers/AxisStretchModifier'
import { LeftClickRubberBandXyZoomModifier } from '../modifiers/LeftClickRubberBandXyZoomModifier'
import { PointMarkModifier } from '../modifiers/PointMarkModifier'
import { ShiftLeftClickZoomPanModifier } from '../modifiers/ShiftLeftClickZoomPanModifier'
import { ZoomHistoryModifier } from '../modifiers/ZoomHistoryModifier'
import { LeftClickZoomPanModifier } from '../modifiers/LeftClickZoomPanModifier'
import {
  SCI_CHART_MODIFIER_KEY_MAP,
  SCI_CHART_DEFAULT_SERIES_COLORS,
  SCI_CHART_DEFAULT_STROKE_THICKNESS,
  SCI_CHART_DEFAULT_ROLLOVER_STROKE,
  SCI_CHART_DEFAULT_ROLLOVER_DASH,
  SCI_CHART_DEFAULT_AXIS_LABEL_COLOR,
  SCI_CHART_DEFAULT_ZERO_LINE_COLOR,
  SCI_CHART_ZERO_LINE_STROKE_THICKNESS,
  SCI_CHART_RESAMPLING_PRECISION_DEFAULT,
  SCI_CHART_RESAMPLING_PRECISION_OFF,
  SCI_CHART_VISIBLE_RANGE_PAD_FACTOR,
  SCI_CHART_STRETCH_SENSITIVITY,
} from '../sciChartWrapperConstants'

const ROLLOVER_TOOLTIP_SERIES_LABEL = (seriesName: string) => `${seriesName}:`
const ROLLOVER_TOOLTIP_X_LABEL = (formattedX: string) => `X: ${formattedX}`
const ROLLOVER_TOOLTIP_Y_LABEL = (formattedY: string) => `Y: ${formattedY}`

import type { ChartZoomCallbacks } from '../../implementationProps'

export interface UseSciChartSurfaceRendererParams {
  data: ConvertedData
  options: ChartOptions
  zoomCallbacks?: ChartZoomCallbacks
}

export const useSciChartSurfaceRenderer = ({
  data,
  options,
  zoomCallbacks,
}: UseSciChartSurfaceRendererParams) => {
  const { lines: lineShapes, boxes } = useMemo(
    () => convertShapes(options.shapes),
    [options.shapes]
  )

  const toModifierKey = (trigger: string): ModifierKey =>
    trigger === 'shift' ? 'Shift' : trigger === 'ctrl' ? 'Ctrl' : trigger === 'alt' ? 'Alt' : (trigger as ModifierKey)

  const stretchEnable = options.stretch?.enable !== false
  const stretchTrigger = options.stretch?.trigger ?? 'rightClick'
  const stretchOnRightClick = stretchTrigger === 'rightClick'
  const stretchKey = stretchOnRightClick ? undefined : SCI_CHART_MODIFIER_KEY_MAP[toModifierKey(stretchTrigger)]

  const panEnable = options.pan?.enable !== false
  const panTrigger = options.pan?.trigger ?? 'shift'
  const panOnLeftClick = panTrigger === 'leftClick'
  const panOnShift = panTrigger === 'shift'
  const panKey = panOnLeftClick ? undefined : SCI_CHART_MODIFIER_KEY_MAP[toModifierKey(panTrigger)]

  const seriesColors = options.defaultSeriesColors ?? [...SCI_CHART_DEFAULT_SERIES_COLORS]
  const strokeThickness = options.defaultStrokeThickness ?? SCI_CHART_DEFAULT_STROKE_THICKNESS

  const rolloverShow = options.rolloverShow !== false
  const rolloverStroke = options.rolloverStroke ?? SCI_CHART_DEFAULT_ROLLOVER_STROKE
  const rolloverDash = dashToStrokeArray(options.rolloverDash) ?? SCI_CHART_DEFAULT_ROLLOVER_DASH

  const resamplingEnabled = options.resampling?.enable !== false
  const resamplingMode = resamplingEnabled ? EResamplingMode.Auto : EResamplingMode.None
  const resamplingPrecision =
    options.resampling?.precision ??
    (resamplingEnabled ? SCI_CHART_RESAMPLING_PRECISION_DEFAULT : SCI_CHART_RESAMPLING_PRECISION_OFF)

  const onMiddleClick = options.events?.onmiddleclick

  const initChart = useMemo(
    () =>
      async (rootElement: HTMLDivElement | string) => {
        const element =
          rootElement === String(rootElement)
            ? document.querySelector<HTMLDivElement>(rootElement)
            : rootElement
        if (!element) throw new Error('SciChart root element not found')
        const createOptions = options.backgroundColor != null ? { background: options.backgroundColor } : undefined
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(element, createOptions)

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

        // Shapes are synced by useShapesSync when options.shapes changes

        const modifiers: InstanceType<typeof import('scichart').ChartModifierBase2D>[] = [
          new PointMarkModifier({
            onMiddleClick: onMiddleClick ?? undefined,
          }),
          new ZoomHistoryModifier({
            callbacks: zoomCallbacks
              ? {
                  setZoomBack: zoomCallbacks.setZoomBack,
                  setPushBeforeReset: zoomCallbacks.setPushBeforeReset,
                  setCanZoomBack: zoomCallbacks.setCanZoomBack,
                }
              : undefined,
          }),
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
                ROLLOVER_TOOLTIP_SERIES_LABEL(seriesInfo.seriesName),
                ROLLOVER_TOOLTIP_X_LABEL(seriesInfo.formattedXValue),
                ROLLOVER_TOOLTIP_Y_LABEL(seriesInfo.formattedYValue),
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
      },
    [
      data,
      options,
      seriesColors,
      strokeThickness,
      resamplingMode,
      resamplingPrecision,
      stretchEnable,
      stretchOnRightClick,
      stretchKey,
      panEnable,
      panOnShift,
      panOnLeftClick,
      panKey,
      rolloverShow,
      rolloverStroke,
      rolloverDash,
      onMiddleClick,
      zoomCallbacks,
    ]
  )

  return { initChart, lineShapes, boxes }
}
