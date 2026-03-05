/**
 * SciChartWrapper – SciChart implementation: conversion, chart surface, and SciChart-specific events.
 * No header, legend, or buttons. Parent provides overlaySlot (e.g. legend) and manages UI state.
 */

import { useContext, useMemo } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
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
import { useChartTheme } from '../../ChartThemeContext'
import { PointMarkClearContext } from '../../PointMarkClearContext'
import { ChartWrapperBox } from '../../styled'
import type { ChartOptions, ModifierKey } from '../types'
import type { ConvertedData } from '../convert'
import { convertShapes, dashToStrokeArray, normalizeShape } from '../convert'
import { AxisStretchModifier } from './modifiers/AxisStretchModifier'
import { LeftClickRubberBandXyZoomModifier } from './modifiers/LeftClickRubberBandXyZoomModifier'
import { PointMarkModifier } from './modifiers/PointMarkModifier'
import { ShiftLeftClickZoomPanModifier } from './modifiers/ShiftLeftClickZoomPanModifier'
import { ZoomHistoryModifier } from './modifiers/ZoomHistoryModifier'
import { LeftClickZoomPanModifier } from './modifiers/LeftClickZoomPanModifier'
import { LegendWithToggle } from './components/LegendWithToggle'
import { PointMarkersSync } from './hooks/usePointMarkersSync'
import { SeriesVisibilitySync } from './hooks/useSeriesVisibilitySync'
import { ZoomResetSync } from './hooks/useZoomResetSync'
import { toInternalOptions } from './convert'
import { DEFAULT_LEGEND_BACKGROUND_COLOR } from './defaults'
import type { SciChartWrapperProps } from './types'

SciChartSurface.configure({
  wasmUrl: '/scichart2d.wasm',
  wasmNoSimdUrl: '/scichart2d-nosimd.wasm',
})

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

const DEFAULT_STROKE_THICKNESS = 2
const DEFAULT_ROLLOVER_STROKE = '#FF0000'
const DEFAULT_ROLLOVER_DASH = [8, 4] as number[]
const DEFAULT_POINT_MARK_ICON = '📍'
const DEFAULT_POINT_MARK_COLOR = '#3388ff'
const DEFAULT_AXIS_LABEL_COLOR = '#ffffff'
const DEFAULT_ZERO_LINE_COLOR = '#ffffff'

const MODIFIER_KEY_MAP: { [K in ModifierKey]?: EModifierMouseArgKey } = {
  Shift: EModifierMouseArgKey.Shift,
  Ctrl: EModifierMouseArgKey.Ctrl,
  Alt: EModifierMouseArgKey.Alt,
}

export const SciChartWrapper = ({
  chartId,
  lines,
  style,
  options: opts = {},
  containerStyle,
  overlaySlot,
  loading = false,
}: SciChartWrapperProps) => {
  if (loading) {
    return (
      <ChartWrapperBox style={containerStyle} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <CircularProgress size={40} sx={{ color: 'text.secondary' }} />
      </ChartWrapperBox>
    )
  }

  const chartTheme = useChartTheme()
  const { registerForChart } = useContext(PointMarkClearContext)

  const seriesVisibility = opts.seriesVisibility ?? Array.from({ length: lines.length }, () => true)
  const { data, options: convertedOptions } = toInternalOptions(
    { chartId, lines, style, options: opts },
    seriesVisibility
  )

  const onMiddleClick = opts.events?.onmiddleclick

  const mergedOptions = useMemo<ChartOptions>(
    () => ({
      ...convertedOptions,
      defaultSeriesColors: chartTheme.defaultSeriesColors,
      rolloverStroke: convertedOptions.rolloverStroke ?? chartTheme.rolloverStroke,
      rolloverDash: convertedOptions.rolloverDash ?? chartTheme.rolloverDash,
      pointMarkIcon: chartTheme.pointMarkIcon,
      pointMarkIconColor: chartTheme.pointMarkIconColor,
      pointMarkIconSize: chartTheme.pointMarkIconSize,
      onSeriesVisibilityChange: opts.onSeriesVisibilityChange,
      onSeriesVisibilityGroupChange: opts.onSeriesVisibilityGroupChange,
      onDisableAll: opts.onDisableAll,
      onPointMark: onMiddleClick
        ? (xValue, yValue, context) =>
            onMiddleClick(xValue, yValue, context) as
              | import('../types').ChartLineShape
              | import('../types').ChartMarkerShape
              | (import('../types').ChartLineShape | import('../types').ChartMarkerShape)[]
              | null
        : undefined,
      ...(chartId && registerForChart
        ? {
            pointMarkRegisterForClear: (
              chartIdParam: string,
              remove: () => void,
              clear: () => void,
              removeLast?: () => void
            ) => registerForChart(chartIdParam, remove, clear, removeLast),
          }
        : {}),
    }),
    [convertedOptions, chartTheme, opts.onSeriesVisibilityChange, opts.onSeriesVisibilityGroupChange, opts.onDisableAll, onMiddleClick, chartId, registerForChart]
  )

  return (
    <ChartWrapperBox style={containerStyle}>
      <SciChartSurfaceRenderer
        data={data}
        options={mergedOptions}
        chartId={chartId}
        overlaySlot={overlaySlot}
      />
    </ChartWrapperBox>
  )
}

interface SciChartSurfaceRendererProps {
  data: ConvertedData
  options: ChartOptions
  chartId?: string
  overlaySlot?: React.ReactNode
}

const SciChartSurfaceRenderer = ({ data, options, chartId, overlaySlot }: SciChartSurfaceRendererProps) => {
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

  const seriesColors = options.defaultSeriesColors ?? DEFAULT_SERIES_COLORS
  const strokeThickness = options.defaultStrokeThickness ?? DEFAULT_STROKE_THICKNESS

  const rolloverShow = options.rolloverShow !== false
  const rolloverStroke = options.rolloverStroke ?? DEFAULT_ROLLOVER_STROKE
  const rolloverDash = dashToStrokeArray(options.rolloverDash) ?? DEFAULT_ROLLOVER_DASH

  const resamplingMode = options.resampling !== false ? EResamplingMode.Auto : EResamplingMode.None
  const resamplingPrecision = options.resamplingPrecision ?? (options.resampling ? 1 : 0)

  const pointMarkIcon = options.pointMarkIcon ?? DEFAULT_POINT_MARK_ICON
  const pointMarkIconColor = options.pointMarkIconColor ?? DEFAULT_POINT_MARK_COLOR
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
    <Box component="div" sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }}>
      <SciChartReact
        style={{ width: '100%', height: '100%', flex: 1, minHeight: 0 }}
        initChart={async (rootElement) => {
          const createOptions = options.backgroundColor != null ? { background: options.backgroundColor } : undefined
          const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, createOptions)

          const axisLabelColor = options.textColor ?? DEFAULT_AXIS_LABEL_COLOR
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
            const pad = (number: number) => (number === 0 ? 1 : Math.abs(number) * 1e-6)
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

          const zeroLineColor = options.zeroLineColor ?? DEFAULT_ZERO_LINE_COLOR
          sciChartSurface.annotations.add(
            new VerticalLineAnnotation({ x1: 0, stroke: zeroLineColor, strokeThickness: 1 })
          )
          sciChartSurface.annotations.add(
            new HorizontalLineAnnotation({ y1: 0, stroke: zeroLineColor, strokeThickness: 1 })
          )

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

          const modifiers: InstanceType<typeof import('scichart').ChartModifierBase2D>[] = [
            new PointMarkModifier({
              onPointMark,
              iconSize: options.pointMarkIconSize ?? 1.5,
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
                sensitivity: 0.5,
              })
            )
          }
          if (panEnable) {
            modifiers.push(
              new (panOnShift ? ShiftLeftClickZoomPanModifier : panOnLeftClick ? LeftClickZoomPanModifier : ZoomPanModifier)({
                executeCondition: {
                  key: panOnShift ? EModifierMouseArgKey.Shift : panKey ?? EModifierMouseArgKey.None,
                },
              })
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
          iconSize={options.pointMarkIconSize ?? 1.5}
        />
        <SeriesVisibilitySync seriesVisibility={options.seriesVisibility} />
        {!options.chartOnly &&
          (overlaySlot ?? (
            <LegendWithToggle
              backgroundColor={options.legendBackgroundColor ?? options.backgroundColor ?? DEFAULT_LEGEND_BACKGROUND_COLOR}
              textColor={options.textColor ?? '#ffffff'}
              seriesVisibility={options.seriesVisibility}
              seriesGroupKeys={data.series.map((series) => series.lineGroupKey)}
              onSeriesVisibilityChange={options.onSeriesVisibilityChange}
              onSeriesVisibilityGroupChange={options.onSeriesVisibilityGroupChange}
            />
          ))}
      </SciChartReact>
    </Box>
  )
}
