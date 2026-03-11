import type { ChartZoomCallbacks } from '../../implementationProps'
import type { ConvertedData } from '../convert'
import type { SciChartDataBounds } from './useSciChartDataBounds'
import type { SciChartInteractionConfig } from './useSciChartInteractionConfig'
import type { SciChartMergedOptions } from './useSciChartMergedOptions'
import type { SciChartSeriesConfig } from './useSciChartSeriesConfig'

import { useMemo } from 'react'
import {
  EModifierMouseArgKey,
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

import { AxisStretchModifier } from '../modifiers/AxisStretchModifier'
import { LeftClickRubberBandXyZoomModifier } from '../modifiers/LeftClickRubberBandXyZoomModifier'
import { LeftClickZoomPanModifier } from '../modifiers/LeftClickZoomPanModifier'
import { PointMarkModifier } from '../modifiers/PointMarkModifier'
import { ShiftLeftClickZoomPanModifier } from '../modifiers/ShiftLeftClickZoomPanModifier'
import { ZoomHistoryModifier } from '../modifiers/ZoomHistoryModifier'
import {
  SCI_CHART_STRETCH_SENSITIVITY,
  SCI_CHART_VISIBLE_RANGE_PAD_FACTOR,
  SCI_CHART_ZERO_LINE_STROKE_THICKNESS,
} from '../sciChartWrapperConstants'
import { dashToStrokeArray } from '../convert'

const ROLLOVER_TOOLTIP_SERIES_LABEL = (seriesName: string) => `${seriesName}:`
const ROLLOVER_TOOLTIP_X_LABEL = (formattedX: string) => `X: ${formattedX}`
const ROLLOVER_TOOLTIP_Y_LABEL = (formattedY: string) => `Y: ${formattedY}`

const getPaddedLimit = (value: number) =>
  value === 0 ? 1 : Math.abs(value) * SCI_CHART_VISIBLE_RANGE_PAD_FACTOR

const resolveRootElement = (rootElement: HTMLDivElement | string) => {
  return rootElement === String(rootElement)
    ? document.querySelector<HTMLDivElement>(rootElement)
    : rootElement
}

export interface UseSciChartInitChartOptions {
  data: ConvertedData
  options: SciChartMergedOptions
  zoomCallbacks?: ChartZoomCallbacks
  dataBounds: SciChartDataBounds
  seriesConfig: SciChartSeriesConfig
  interactionConfig: SciChartInteractionConfig
}

export const useSciChartInitChart = ({
  data,
  options,
  zoomCallbacks,
  dataBounds,
  seriesConfig,
  interactionConfig,
}: UseSciChartInitChartOptions) => {
  return useMemo(
    () =>
      async (rootElement: HTMLDivElement | string) => {
        const element = resolveRootElement(rootElement)
        if (!element) throw new Error('SciChart root element not found')

        const { sciChartSurface, wasmContext } = await SciChartSurface.create(
          element,
          { background: options.backgroundColor }
        )

        const axisLabelColor = options.textColor
        const axisOptions = { labelStyle: { color: axisLabelColor } }
        const xAxis = new NumericAxis(wasmContext, axisOptions)
        const yAxis = new NumericAxis(wasmContext, axisOptions)
        sciChartSurface.xAxes.add(xAxis)
        sciChartSurface.yAxes.add(yAxis)

        if (options.clipZoomToData && Number.isFinite(dataBounds.xMin)) {
          xAxis.visibleRangeLimit = new NumberRange(
            dataBounds.xMin - getPaddedLimit(dataBounds.xMin),
            dataBounds.xMax + getPaddedLimit(dataBounds.xMax)
          )
          if (Number.isFinite(dataBounds.yMin) && Number.isFinite(dataBounds.yMax)) {
            yAxis.visibleRangeLimit = new NumberRange(
              dataBounds.yMin - getPaddedLimit(dataBounds.yMin),
              dataBounds.yMax + getPaddedLimit(dataBounds.yMax)
            )
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
          const isVisible = data.seriesVisibility[index]
          const strokeDashArray = dashToStrokeArray(lineStyle.dash)
          const series = new FastLineRenderableSeries(wasmContext, {
            dataSeries,
            stroke: lineStyle.color,
            strokeThickness: lineStyle.thickness,
            strokeDashArray,
            resamplingMode: seriesConfig.resamplingMode,
            resamplingPrecision: seriesConfig.resamplingPrecision,
            isVisible,
          })

          sciChartSurface.renderableSeries.add(series)
        }

        const zeroLineColor = options.zeroLineColor
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

        const modifiers: InstanceType<typeof import('scichart').ChartModifierBase2D>[] = [
          new PointMarkModifier({
            onMiddleClick: interactionConfig.onMiddleClick,
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
          new LeftClickRubberBandXyZoomModifier({
            executeCondition: { key: EModifierMouseArgKey.None },
          }),
        ]

        if (interactionConfig.stretchEnable) {
          modifiers.push(
            new AxisStretchModifier({
              executeOnRightClick: interactionConfig.stretchOnRightClick,
              executeCondition:
                interactionConfig.stretchKey != null
                  ? {
                      key: interactionConfig.stretchKey as EModifierMouseArgKey,
                    }
                  : undefined,
              sensitivity: SCI_CHART_STRETCH_SENSITIVITY,
            })
          )
        }

        if (interactionConfig.panEnable) {
          modifiers.push(
            new (interactionConfig.panOnShift
              ? ShiftLeftClickZoomPanModifier
              : interactionConfig.panOnLeftClick
                ? LeftClickZoomPanModifier
                : ZoomPanModifier)({
              executeCondition: {
                key: interactionConfig.panOnShift
                  ? EModifierMouseArgKey.Shift
                  : ((interactionConfig.panKey as EModifierMouseArgKey | undefined) ??
                    EModifierMouseArgKey.None),
              },
            })
          )
        }

        modifiers.push(new MouseWheelZoomModifier(), new ZoomExtentsModifier())

        if (interactionConfig.rolloverShow) {
          modifiers.push(
            new RolloverModifier({
              tooltipDataTemplate: (seriesInfo) => [
                ROLLOVER_TOOLTIP_SERIES_LABEL(seriesInfo.seriesName),
                ROLLOVER_TOOLTIP_X_LABEL(seriesInfo.formattedXValue),
                ROLLOVER_TOOLTIP_Y_LABEL(seriesInfo.formattedYValue),
              ],
              rolloverLineStroke: interactionConfig.rolloverStroke,
              rolloverLineStrokeDashArray: interactionConfig.rolloverDash,
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
      zoomCallbacks,
      dataBounds,
      seriesConfig,
      interactionConfig,
    ]
  )
}
