/**
 * SciChartWrapper – SciChart implementation: conversion, chart surface, and SciChart-specific events.
 * No header, legend, or buttons. Parent provides overlaySlot (e.g. legend) and manages UI state.
 */

import {
  CHART_DEFAULT_SERIES_COLORS,
  CHART_FALLBACK_ROLLOVER_STROKE,
  CHART_ROLLOVER_DASH_STEPS,
} from '../../chartConstants'
import type { ChartImplementationProps } from '../implementationProps'

import { SciChartSurface } from 'scichart'
import { ChartWrapperBox } from '../../../styled'
import { toInternalOptions } from './convert'

import { SkeletonLoading } from '../../../shared'
import { useSciChartMergedOptions } from './hooks/useSciChartMergedOptions'
import { SciChartSurfaceRenderer } from './SciChartSurfaceRenderer'
import { SCI_CHART_WASM_NO_SIMD_URL, SCI_CHART_WASM_URL } from './sciChartWrapperConstants'

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
  const seriesVisibility = opts.seriesVisibility ?? Array.from({ length: lines.length }, () => true)
  const { data: convertedData, options: convertedOptions } = toInternalOptions(
    { chartId, lines, style, options: opts },
    seriesVisibility
  )

  const mergedTheme = {
    defaultSeriesColors: CHART_DEFAULT_SERIES_COLORS,
    rolloverStroke: CHART_FALLBACK_ROLLOVER_STROKE,
    rolloverDash: { isDash: true, steps: [...CHART_ROLLOVER_DASH_STEPS] },
  }

  const mergedOptions = useSciChartMergedOptions({
    convertedOptions,
    chartTheme: mergedTheme,
    opts,
  })

  if (loading) {
    return (
      <ChartWrapperBox style={containerStyle}>
        <SkeletonLoading />
      </ChartWrapperBox>
    )
  }

  return (
    <ChartWrapperBox style={containerStyle}>
      <SciChartSurfaceRenderer
        data={convertedData}
        options={mergedOptions}
        zoomCallbacks={zoomCallbacks}
        overlaySlot={overlaySlot}
      />
    </ChartWrapperBox>
  )
}
