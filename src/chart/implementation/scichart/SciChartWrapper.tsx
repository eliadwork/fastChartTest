/**
 * SciChartWrapper – SciChart implementation: conversion, chart surface, and SciChart-specific events.
 * No header, legend, or buttons. Parent provides overlaySlot (e.g. legend) and manages UI state.
 */

import type { ChartImplementationProps } from '../implementationProps'

import { useContext } from 'react'
import { SciChartSurface } from 'scichart'
import { useChartTheme } from '../../../ChartThemeContext'
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
  if (loading) {
    return (
      <ChartWrapperBox style={containerStyle}>
        <SkeletonLoading />
      </ChartWrapperBox>
    )
  }

  const chartTheme = useChartTheme()
  const { registerForChart } = useContext(PointMarkClearContext)

  const seriesVisibility = opts.seriesVisibility ?? Array.from({ length: lines.length }, () => true)
  const { data: convertedData, options: convertedOptions } = toInternalOptions(
    { chartId, lines, style, options: opts },
    seriesVisibility
  )

  const onMiddleClick = opts.events?.onmiddleclick

  const mergedOptions = useSciChartMergedOptions({
    convertedOptions,
    chartTheme,
    opts,
    onMiddleClick,
    chartId,
    registerForChart,
  })

  return (
    <ChartWrapperBox style={containerStyle}>
      <SciChartSurfaceRenderer
        data={convertedData}
        options={mergedOptions}
        chartId={chartId}
        zoomCallbacks={zoomCallbacks}
        overlaySlot={overlaySlot}
      />
    </ChartWrapperBox>
  )
}
