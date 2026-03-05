/**
 * SciChartChart – SciChart implementation of the generic Chart API.
 *
 * This is the implementation layer: it receives ConvertedData (Float64Arrays) and ChartOptions,
 * and renders a SciChart surface with series, annotations, and modifiers.
 *
 * Architecture: Chart.tsx (generic) → convertData() → SciChartChart (this file).
 * All SciChart-specific imports live here; types.ts and convert.ts stay library-agnostic.
 */
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
import Box from '@mui/material/Box'

// SciChart uses WebAssembly for rendering. WASM files are copied to public/ by postinstall.
SciChartSurface.configure({
  wasmUrl: '/scichart2d.wasm',
  wasmNoSimdUrl: '/scichart2d-nosimd.wasm',
})
import { SciChartReact } from 'scichart-react'
import type { ChartOptions, ModifierKey } from '../types'
import type { ConvertedData } from '../convert'
import { convertShapes, dashToStrokeArray, normalizeShape } from '../convert'
import { AxisStretchModifier } from './AxisStretchModifier'
import { LeftClickRubberBandXyZoomModifier } from './LeftClickRubberBandXyZoomModifier'
import { PointMarkersSync } from './PointMarkersSync'
import { SeriesVisibilitySync } from './SeriesVisibilitySync'
import { LeftClickZoomPanModifier } from './LeftClickZoomPanModifier'
import { LegendSync } from './LegendSync'
import { PointMarkModifier } from './PointMarkModifier'
import { ShiftLeftClickZoomPanModifier } from './ShiftLeftClickZoomPanModifier'
import { ZoomHistoryModifier } from './ZoomHistoryModifier'
import { ZoomResetSync } from './ZoomResetSync'

/** Fallback colors when options.defaultSeriesColors is not provided. */
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

/** Maps our ModifierKey (Shift/Ctrl/Alt) to SciChart's EModifierMouseArgKey. */
const MODIFIER_KEY_MAP: Record<ModifierKey, EModifierMouseArgKey> = {
  Shift: EModifierMouseArgKey.Shift,
  Ctrl: EModifierMouseArgKey.Ctrl,
  Alt: EModifierMouseArgKey.Alt,
}

export interface SciChartChartProps {
  data: ConvertedData
  options: ChartOptions
  style?: React.CSSProperties
  chartId?: string
}

export const SciChartChart = ({ data, options, style, chartId }: SciChartChartProps) => {
  // --- Shape annotations (lines, boxes) from options.shapes ---
  const { lines: lineShapes, boxes } = convertShapes(options.shapes)

  // --- Stretch zoom: right-click drag to stretch axis, or modifier key ---
  const stretchTrigger = options.stretchTrigger ?? 'rightClick'
  const stretchOnRightClick = stretchTrigger === 'rightClick'
  const stretchKey = stretchOnRightClick ? undefined : MODIFIER_KEY_MAP[stretchTrigger as ModifierKey]

  // --- Pan: Shift+drag, left-click drag, or modifier key ---
  const panTrigger = options.panTrigger ?? options.panKey ?? 'Shift'
  const panOnLeftClick = panTrigger === 'leftClick'
  const panOnShift = panTrigger === 'Shift'
  const panKey = panOnLeftClick ? undefined : MODIFIER_KEY_MAP[panTrigger as ModifierKey]

  // --- Series styling defaults ---
  const seriesColors = options.defaultSeriesColors ?? DEFAULT_SERIES_COLORS
  const strokeThickness = options.defaultStrokeThickness ?? 2

  // --- Rollover: hover line + tooltip styling ---
  const rolloverStroke = options.rolloverStroke ?? '#FF0000'
  const rolloverDash = dashToStrokeArray(options.rolloverDash) ?? [8, 4]

  // --- Resampling: reduces points for performance on large datasets ---
  const resamplingMode = options.resampling !== false ? EResamplingMode.Auto : EResamplingMode.None
  const resamplingPrecision = options.resamplingPrecision ?? (options.resampling ? 1 : 0)

  // --- 3-click point mark: middle-click to place markers ---
  const pointMarkIcon = options.pointMarkIcon ?? '📍'
  const pointMarkIconColor = options.pointMarkIconColor ?? '#3388ff'
  const onPointMark = options.onPointMark
    ? (xValue: number, yValue: number, context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }) => {
        // Inject defaults for context so onPointMark always receives valid callbacks
        const contextWithBindable = {
          ...context,
          getSeriesVisibility: context?.getSeriesVisibility ?? (() => [] as boolean[]),
          seriesBindable: context?.seriesBindable ?? data.seriesBindable,
        }
        const result = options.onPointMark!(xValue, yValue, contextWithBindable)
        if (!result) return null
        const arr = Array.isArray(result) ? result : [result]
        // Normalize shapes: markers get default icon/color; lines get strokeDashArray from dash
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
    <Box
      component="div"
      sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 0 }}
    >
      <SciChartReact
        style={style}
        initChart={async (rootElement) => {
        // --- Create surface and axes ---
        const createOptions = options.backgroundColor != null ? { background: options.backgroundColor } : undefined
        const { sciChartSurface, wasmContext } = await SciChartSurface.create(rootElement, createOptions)

        const axisLabelColor = options.textColor ?? '#ffffff'
        const axisOptions = { labelStyle: { color: axisLabelColor } }
        const xAxis = new NumericAxis(wasmContext, axisOptions)
        const yAxis = new NumericAxis(wasmContext, axisOptions)
        sciChartSurface.xAxes.add(xAxis)
        sciChartSurface.yAxes.add(yAxis)

        // --- Compute data bounds for clipZoomToData (visibleRangeLimit) ---
        let xMin = Infinity
        let xMax = -Infinity
        let yMin = Infinity
        let yMax = -Infinity
        for (const s of data.series) {
          for (let i = 0; i < s.x.length; i++) {
            const v = s.x[i]
            if (Number.isFinite(v)) {
              if (v < xMin) xMin = v
              if (v > xMax) xMax = v
            }
          }
          for (let i = 0; i < s.y.length; i++) {
            const v = s.y[i]
            if (Number.isFinite(v)) {
              if (v < yMin) yMin = v
              if (v > yMax) yMax = v
            }
          }
        }

        // --- Restrict zoom/pan to data range when clipZoomToData is true ---
        if (options.clipZoomToData !== false && Number.isFinite(xMin)) {
          const pad = (n: number) => (n === 0 ? 1 : Math.abs(n) * 1e-6) // tiny padding for single-point data
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

        // --- Add line series (one per line in data) ---
        for (let i = 0; i < data.series.length; i++) {
          const line = data.series[i]
          const dataSeries = new XyDataSeries(wasmContext, {
            xValues: line.x,
            yValues: line.y,
            isSorted: true,
            containsNaN: false,
            dataSeriesName: line.name,
          })

          const lineStyle = line.style
          const isVisible = data.seriesVisibility?.[i] ?? true
          const strokeColor =
            lineStyle.color ?? seriesColors[i % seriesColors.length]
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

        // --- Zero axis lines (x=0 and y=0) ---
        const zeroLineColor = options.zeroLineColor ?? '#ffffff'
        sciChartSurface.annotations.add(
          new VerticalLineAnnotation({
            x1: 0,
            stroke: zeroLineColor,
            strokeThickness: 1,
          })
        )
        sciChartSurface.annotations.add(
          new HorizontalLineAnnotation({
            y1: 0,
            stroke: zeroLineColor,
            strokeThickness: 1,
          })
        )

        // --- Vertical/horizontal line annotations from options.shapes ---
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

        // --- Box annotations (rectangles) from options.shapes. Coordinates default to data bounds if omitted. ---
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

        // --- Chart modifiers: interaction handlers (order matters for hit-testing) ---
        sciChartSurface.chartModifiers.add(
          new PointMarkModifier({ // 3-click point mark: middle-click to place
            onPointMark,
            iconSize: options.pointMarkIconSize ?? 1.5,
            chartId: chartId ?? undefined,
            onRegisterForClear: options.pointMarkRegisterForClear,
          }),
          new ZoomHistoryModifier({ chartId }), // tracks zoom stack for "zoom back"
          new LeftClickRubberBandXyZoomModifier({ // left-click drag to zoom
            executeCondition: { key: EModifierMouseArgKey.None },
          }),
          new AxisStretchModifier({ // right-click or modifier+drag to stretch axis
              executeOnRightClick: stretchOnRightClick,
              executeCondition: stretchKey != null ? { key: stretchKey } : undefined,
              sensitivity: 0.5,
            }),
          new (panOnShift // pan: Shift+drag, left-click drag, or modifier+drag
            ? ShiftLeftClickZoomPanModifier
            : panOnLeftClick
              ? LeftClickZoomPanModifier
              : ZoomPanModifier)({
            executeCondition: {
              key: panOnShift ? EModifierMouseArgKey.Shift : panKey ?? EModifierMouseArgKey.None,
            },
          }),
          new MouseWheelZoomModifier(), // scroll to zoom
          new ZoomExtentsModifier(), // double-click or "reset" to fit all data
          new RolloverModifier({ // hover: vertical line + tooltip
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
      {/* Sync components: bridge React state to SciChart surface (must be children of SciChartReact) */}
      <ZoomResetSync chartId={chartId} />
      <PointMarkersSync
        icons={options.icons ?? []}
        pointMarkers={options.pointMarkers ?? []}
        defaultIcon={pointMarkIcon}
        defaultColor={pointMarkIconColor}
        iconSize={options.pointMarkIconSize ?? 1.5}
      />
      <SeriesVisibilitySync seriesVisibility={options.seriesVisibility} /> {/* syncs legend toggles to series.isVisible */}
      <LegendSync
        backgroundColor={options.legendBackgroundColor ?? options.backgroundColor}
        textColor={options.textColor ?? '#ffffff'}
        seriesVisibility={options.seriesVisibility}
        seriesGroupKeys={options.seriesGroupKeys ?? data.series.map((s) => s.seriesKey)}
        onSeriesVisibilityChange={options.onSeriesVisibilityChange}
        onSeriesVisibilityGroupChange={options.onSeriesVisibilityGroupChange}
      />
    </SciChartReact>
    </Box>
  )
}
