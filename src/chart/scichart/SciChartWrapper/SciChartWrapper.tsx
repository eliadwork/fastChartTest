/**
 * SciChartWrapper – SciChart implementation: conversion, chart surface, and SciChart-specific events.
 * No header, legend, or buttons. Parent provides overlaySlot (e.g. legend) and manages UI state.
 */

import { useContext } from 'react'
import { SciChartSurface } from 'scichart'
import { useChartTheme } from '../../../ChartThemeContext'
import { PointMarkClearContext } from '../../../PointMarkClearContext'
import { ChartWrapperBox } from '../../../styled'
import { toInternalOptions } from '../convert'
import type { SciChartWrapperProps } from '../types'

import { useSciChartMergedOptions } from './hooks/useSciChartMergedOptions'
import { SciChartLoadingBox, SciChartLoadingSpinner } from './SciChartWrapperStyled'
import {
  SCI_CHART_WASM_URL,
  SCI_CHART_WASM_NO_SIMD_URL,
  SCI_CHART_LOADING_SPINNER_SIZE,
} from './sciChartWrapperConstants'
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
  containerStyle,
  overlaySlot,
  loading = false,
}: SciChartWrapperProps) => {
  if (loading) {
    return (
      <ChartWrapperBox style={containerStyle}>
        <SciChartLoadingBox>
          <SciChartLoadingSpinner size={SCI_CHART_LOADING_SPINNER_SIZE} />
        </SciChartLoadingBox>
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
        data={data}
        options={mergedOptions}
        chartId={chartId}
        overlaySlot={overlaySlot}
      />
    </ChartWrapperBox>
  )
}
