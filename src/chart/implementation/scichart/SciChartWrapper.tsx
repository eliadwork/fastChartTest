/**
 * SciChartWrapper – SciChart implementation: conversion, chart surface, and SciChart-specific events.
 * No header, legend, or buttons. Parent provides overlaySlot (e.g. legend) and manages UI state.
 */

import type { ChartImplementationProps } from '../implementationProps'
import { DEFAULT_POINT_MARK_ICON_SVG } from '../../../assets/pointMarkIcon'
import {
  CHART_DEFAULT_SERIES_COLORS,
  CHART_FALLBACK_ROLLOVER_STROKE,
  CHART_ROLLOVER_DASH_STEPS,
} from '../../chartConstants'

import { useContext } from 'react'
import { SciChartSurface } from 'scichart'
import { PointMarkClearContext } from '../../../PointMarkClearContext'
import { ChartWrapperBox } from '../../../styled'
import { toInternalOptions } from './convert'

import { useSciChartMergedOptions } from './hooks/useSciChartMergedOptions'
import { SkeletonLoading } from '../../../shared'
import { SCI_CHART_WASM_URL, SCI_CHART_WASM_NO_SIMD_URL } from './sciChartWrapperConstants'
import { SciChartSurfaceRenderer } from './SciChartSurfaceRenderer'

SciChartSurface.configure({
  wasmUrl: SCI_CHART_WASM_URL,
  wasmNoSimdUrl: SCI_CHART_WASM_NO_SIMD_URL,
})

export const SciChartWrapper = ({
  chartId,
  lines,
  style,
  options: opts = {},
  zoomCallbacks,
  containerStyle,
  overlaySlot,
  loading = false,
}: ChartImplementationProps) => {
  const { registerForChart } = useContext(PointMarkClearContext)

  const seriesVisibility = opts.seriesVisibility ?? Array.from({ length: lines.length }, () => true)
  const { data: convertedData, options: convertedOptions } = toInternalOptions(
    { chartId, lines, style, options: opts },
    seriesVisibility
  )

  const onMiddleClick = opts.events?.onmiddleclick

  const mergedTheme = {
    defaultSeriesColors: CHART_DEFAULT_SERIES_COLORS,
    rolloverStroke: CHART_FALLBACK_ROLLOVER_STROKE,
    rolloverDash: { isDash: true, steps: [...CHART_ROLLOVER_DASH_STEPS] },
    pointMarkIcon: DEFAULT_POINT_MARK_ICON_SVG,
    pointMarkIconColor: '#3388ff',
    pointMarkIconSize: 1.5,
  }

  const mergedOptions = useSciChartMergedOptions({
    convertedOptions,
    chartTheme: mergedTheme,
    opts,
    onMiddleClick,
    chartId,
    registerForChart,
  })

  if (loading) {
    return (
        <SkeletonLoading />
    )
  }

  return (
      <SciChartSurfaceRenderer
        data={convertedData}
        options={mergedOptions}
        chartId={chartId}
        zoomCallbacks={zoomCallbacks}
        overlaySlot={overlaySlot}
      />
  )
}
