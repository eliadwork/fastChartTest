import { useTheme } from '@mui/material/styles'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePointMarkStore } from '../../store/pointMarkStore'
import { withOpacity } from '../../utils/colorUtils'
import { CHART_LEGEND_BACKGROUND_OPACITY } from '../chartConstants'
import type { ChartOptionsInput } from '../chartTypes'
import { DEFAULT_LEGEND_BACKGROUND_COLOR } from '../defaults'
import type { ChartData, ChartIcon, ChartStyle } from '../types'
import { useChartSeriesVisibility } from './useChartSeriesVisibility'
import { useChartWrapperOptions } from './useChartWrapperOptions'
import { useChartWrapperStyle } from './useChartWrapperStyle'

export interface UseChartParams {
  data: ChartData | null
  chartId?: string
  title?: string
  options?: ChartOptionsInput
  icons?: ChartIcon[]
  chartStyle?: ChartStyle
}

export const useChart = ({
  data,
  chartId,
  title,
  options = {},
  icons,
  chartStyle,
}: UseChartParams) => {
  const theme = useTheme()
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

  const chartIdForModal = usePointMarkStore((state) => state.chartIdForModal)
  const updateModalSeriesVisibility = usePointMarkStore((state) => state.updateModalSeriesVisibility)

  const {
    seriesVisibility,
    handleDisableAll,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    allSeriesHidden,
  } = useChartSeriesVisibility({
    initialSeriesCount: seriesCount,
    initialVisibility: options.seriesVisibility,
  })

  useEffect(() => {
    if (chartId != null && chartId === chartIdForModal) {
      updateModalSeriesVisibility(seriesVisibility)
    }
  }, [chartId, chartIdForModal, seriesVisibility, updateModalSeriesVisibility])

  const wrapperStyle = useChartWrapperStyle({
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
    const bg = theme.palette.background.paper
    if (bg == null) return DEFAULT_LEGEND_BACKGROUND_COLOR
    return withOpacity(bg, CHART_LEGEND_BACKGROUND_OPACITY)
  }, [theme.palette.background.paper])

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

  const headerSx = useMemo(
    () => ({
      ...(theme.palette.background.paper
        ? { backgroundColor: theme.palette.background.paper }
        : {}),
      ...(textColor ? { color: textColor } : {}),
    }),
    [theme.palette.background.paper, textColor]
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
    zoomBackRef,
    zoomResetRef,
    canZoomBack,
    handleDisableAll,
    allSeriesHidden,
    loading,
  }
}
