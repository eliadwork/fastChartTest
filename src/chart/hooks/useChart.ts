import { useCallback, useMemo, useRef, useState } from 'react'
import { useChartTheme } from '../../ChartThemeContext'
import { withOpacity } from '../../chartTheme'
import { DEFAULT_LEGEND_BACKGROUND_COLOR } from '../defaults'
import { useChartSeriesVisibility } from './useChartSeriesVisibility'
import { useChartWrapperOptions } from './useChartWrapperOptions'
import { useChartWrapperStyle } from './useChartWrapperStyle'
import {
  CHART_LEGEND_BACKGROUND_OPACITY,
  CHART_TOOLBAR_BUTTON_MIN_WIDTH,
  CHART_TOOLBAR_BUTTON_PADDING_X,
} from '../chartConstants'
import type { ChartData, ChartIcon, ChartStyle } from '../types'
import type { ChartOptionsInput } from '../chartTypes'

export interface UseChartParams {
  data: ChartData | null
  chartId?: string
  title?: string
  options?: ChartOptionsInput
  icons?: ChartIcon[]
  chartStyle?: ChartStyle
  onSeriesVisibilityChange?: (visibility: boolean[]) => void
}

export const useChart = ({
  data,
  chartId,
  title,
  options = {},
  icons,
  chartStyle,
  onSeriesVisibilityChange,
}: UseChartParams) => {
  const chartTheme = useChartTheme()
  const chartData = data ?? []
  const seriesCount = chartData.length
  const loading = data == null

  const zoomBackRef = useRef<(() => void) | null>(null)
  const zoomResetRef = useRef<(() => void) | null>(null)
  const [canZoomBack, setCanZoomBack] = useState(false)
  const pushBeforeResetRef = useRef<(() => void) | null>(null)

  const setZoomBack = useCallback((fn: () => void) => {
    zoomBackRef.current = fn
  }, [])
  const setZoomReset = useCallback((fn: () => void) => {
    zoomResetRef.current = fn
  }, [])
  const setPushBeforeReset = useCallback((fn: () => void) => {
    pushBeforeResetRef.current = fn
  }, [])

  const zoomCallbacks = useMemo<import('../implementation/implementationProps').ChartZoomCallbacks>(
    () => ({
      setZoomBack,
      setZoomReset,
      setCanZoomBack,
      setPushBeforeReset,
      pushBeforeResetRef,
    }),
    [setZoomBack, setZoomReset, setPushBeforeReset]
  )

  const {
    seriesVisibility,
    handleDisableAll,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    allSeriesHidden,
  } = useChartSeriesVisibility({
    initialSeriesCount: seriesCount,
    initialVisibility: options.seriesVisibility,
    onSeriesVisibilityChange,
    onSeriesVisibilityChangePerIndex: options.onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange: options.onSeriesVisibilityGroupChange,
  })

  const wrapperStyle = useChartWrapperStyle({
    chartTheme,
    chartStyle,
    optionsTextColor: options.textColor,
    optionsZeroLineColor: options.zeroLineColor,
  })

  const wrapperOptions = useChartWrapperOptions({
    options,
    icons,
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleDisableAll,
  })

  const textColor = wrapperStyle.textColor
  const showHeader =
    !wrapperStyle.chartOnly &&
    (title != null || options.note != null || !loading)

  const legendBackgroundColor = useMemo(() => {
    if (chartTheme.backgroundColor == null) return DEFAULT_LEGEND_BACKGROUND_COLOR
    return withOpacity(
      chartTheme.backgroundColor,
      chartTheme.legendBackgroundOpacity ?? CHART_LEGEND_BACKGROUND_OPACITY
    )
  }, [chartTheme.backgroundColor, chartTheme.legendBackgroundOpacity])

  const legendOverlay = useMemo(() => {
    if (wrapperStyle.chartOnly || data == null) return null
    return {
      backgroundColor: legendBackgroundColor,
      textColor,
      seriesVisibility,
      seriesGroupKeys: options.seriesGroupKeys ?? chartData.map((series) => series.lineGroupKey),
      handleSeriesVisibilityChange,
      handleSeriesVisibilityGroupChange,
    }
  }, [
    wrapperStyle.chartOnly,
    data,
    legendBackgroundColor,
    textColor,
    seriesVisibility,
    options.seriesGroupKeys,
    chartData,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
  ])

  const toolbarButtonSx = useMemo(
    () =>
      textColor
        ? {
            color: textColor,
            borderColor: textColor,
            minWidth: CHART_TOOLBAR_BUTTON_MIN_WIDTH,
            px: CHART_TOOLBAR_BUTTON_PADDING_X,
          }
        : {
            minWidth: CHART_TOOLBAR_BUTTON_MIN_WIDTH,
            px: CHART_TOOLBAR_BUTTON_PADDING_X,
          },
    [textColor]
  )

  const headerSx = useMemo(
    () => ({
      ...(chartTheme.backgroundColor ? { backgroundColor: chartTheme.backgroundColor } : {}),
      ...(textColor ? { color: textColor } : {}),
    }),
    [chartTheme.backgroundColor, textColor]
  )

  return {
    chartData,
    chartId,
    wrapperStyle,
    wrapperOptions,
    zoomCallbacks,
    textColor,
    showHeader,
    headerSx,
    options,
    legendOverlay,
    toolbarButtonSx,
    zoomBackRef,
    zoomResetRef,
    canZoomBack,
    handleDisableAll,
    allSeriesHidden,
    loading,
  }
}
