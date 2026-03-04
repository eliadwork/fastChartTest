import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { Chart } from './chart'
import type { ChartData, ChartOptions, ChartLineStyle } from './chart'
import { useChartTheme } from './ChartThemeContext'
import { LogoIcon } from './assets/pointMarkIcon'
import { withOpacity } from './chartTheme'
import { PointMarkClearContext } from './PointMarkClearContext'
import { usePointMarkStore } from './store/pointMarkStore'
import { ChartPanelHeader, ChartPanelHeaderText, ChartPanelTitle, ChartPanelNote, ChartToolbarButton, ChartWrapperBox } from './styled'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import UndoIcon from '@mui/icons-material/Undo'
import { useZoomBackStore } from './store/zoomBackStore'
import { useZoomResetStore } from './store/zoomResetStore'

const DEFAULT_OPTIONS: ChartOptions = {
  stretchTrigger: 'rightClick',
  panTrigger: 'Shift',
  clipZoomToData: true,
  resampling: true,
  resamplingPrecision: 1,
}

export interface ChartWrapperProps {
  chartId?: string
  data: ChartData
  options?: ChartOptions
  style?: React.CSSProperties
  lines?: ChartLineStyle[]
  /** Default line thickness for all series. Override per-series via lines[].thickness */
  defaultLineThickness?: number
  /** Icons at chart locations. iconImage: SVG string, image URL, or character. */
  icons?: Array<{ iconImage: string; location: { x: number; y: number } }>
  /** @deprecated Use icons instead. */
  pointMarkers?: Array<{ x: number; y: number; icon?: string; color?: string }>
  /** Panel title shown in header */
  title?: string
  /** Show disable/enable all graphs button in header. Default: true */
  showDisableAllButton?: boolean
}

export const ChartWrapper = ({
  chartId,
  data,
  options = {},
  style,
  lines,
  defaultLineThickness,
  icons,
  pointMarkers,
  title,
  showDisableAllButton = true,
}: ChartWrapperProps) => {
  const chartTheme = useChartTheme()
  const { registerForChart } = useContext(PointMarkClearContext)
  const chartIdForModal = usePointMarkStore((s) => s.chartIdForModal)
  const updateModalSeriesVisibility = usePointMarkStore((s) => s.updateModalSeriesVisibility)
  const zoomBack = useZoomBackStore((s) => s.zoomBack)
  const canZoomBack = useZoomBackStore((s) => s.canZoomBackFor(chartId ?? ''))
  const zoomReset = useZoomResetStore((s) => s.zoomReset)
  const seriesCount = (data.ys ?? data.series ?? []).length
  const [seriesVisibility, setSeriesVisibility] = useState<boolean[]>(
    () => Array.from({ length: seriesCount }, () => true)
  )

  useEffect(() => {
    setSeriesVisibility((prev) => {
      if (prev.length === seriesCount) return prev
      if (prev.length < seriesCount) return [...prev, ...Array.from({ length: seriesCount - prev.length }, () => true)]
      return prev.slice(0, seriesCount)
    })
  }, [seriesCount])

  useEffect(() => {
    if (chartId && chartId === chartIdForModal) {
      updateModalSeriesVisibility(seriesVisibility)
    }
  }, [chartId, chartIdForModal, seriesVisibility, updateModalSeriesVisibility])

  const handleDisableAll = useCallback(() => {
    setSeriesVisibility((prev) => (prev.every((v) => !v) ? prev.map(() => true) : prev.map(() => false)))
  }, [])

  const handleSeriesVisibilityChange = useCallback((index: number, visible: boolean) => {
    setSeriesVisibility((prev) => {
      const next = [...prev]
      if (index >= 0 && index < next.length) next[index] = visible
      return next
    })
  }, [])

  const handleSeriesVisibilityGroupChange = useCallback((indices: number[], visible: boolean) => {
    setSeriesVisibility((prev) => {
      const next = [...prev]
      for (const i of indices) {
        if (i >= 0 && i < next.length) next[i] = visible
      }
      return next
    })
  }, [])

  const mergedOptions = useMemo(
    () => ({
      ...DEFAULT_OPTIONS,
      defaultSeriesColors: chartTheme.defaultSeriesColors,
      rolloverStroke: chartTheme.rolloverStroke,
      rolloverDash: chartTheme.rolloverDash,
      pointMarkIcon: chartTheme.pointMarkIcon,
      pointMarkIconColor: chartTheme.pointMarkIconColor,
      pointMarkIconSize: options.pointMarkIconSize ?? chartTheme.pointMarkIconSize,
      zeroLineColor: chartTheme.zeroLineColor ?? options.zeroLineColor,
      backgroundColor:
        chartTheme.backgroundColor != null
          ? withOpacity(chartTheme.backgroundColor, chartTheme.chartBackgroundOpacity ?? 0.2)
          : undefined,
      legendBackgroundColor:
        chartTheme.backgroundColor != null
          ? withOpacity(chartTheme.backgroundColor, chartTheme.chartBackgroundOpacity ?? 0.2)
          : undefined,
      textColor: chartTheme.textColor ?? options.textColor,
      ...options,
      defaultStrokeThickness: defaultLineThickness ?? options.defaultStrokeThickness ?? chartTheme.defaultStrokeThickness ?? 2,
      seriesLines: lines ?? options.seriesLines,
      icons: icons ?? options.icons,
      pointMarkers: pointMarkers ?? options.pointMarkers,
      seriesVisibility: options.seriesVisibility ?? seriesVisibility,
      onSeriesVisibilityChange: options.onSeriesVisibilityChange ?? handleSeriesVisibilityChange,
      onSeriesVisibilityGroupChange: options.onSeriesVisibilityGroupChange ?? handleSeriesVisibilityGroupChange,
      ...(chartId && registerForChart
        ? {
            pointMarkRegisterForClear: (
              cid: string,
              remove: () => void,
              clear: () => void,
              removeLast?: () => void
            ) => registerForChart(cid, remove, clear, removeLast),
          }
        : {}),
    }),
    [chartTheme, options, lines, defaultLineThickness, icons, pointMarkers, seriesVisibility, seriesCount, chartId, registerForChart, handleSeriesVisibilityChange, handleSeriesVisibilityGroupChange]
  )

  const showHeader = title != null || showDisableAllButton || options.note != null

  const headerBg =
    chartTheme.backgroundColor != null
      ? chartTheme.backgroundColor
      : undefined
  const textColor = chartTheme.textColor ?? options.textColor

  return (
    <ChartWrapperBox>
      {showHeader && (
        <ChartPanelHeader
          sx={{
            ...(headerBg ? { backgroundColor: headerBg } : {}),
            ...(textColor ? { color: textColor } : {}),
          }}
        >
          <ChartPanelHeaderText>
            {title != null && <ChartPanelTitle variant="subtitle1">{title}</ChartPanelTitle>}
            {options.note != null && (
              <ChartPanelNote variant="body2">
                {options.note}
              </ChartPanelNote>
            )}
          </ChartPanelHeaderText>
          <Box sx={{ display: 'flex', gap: '0.5rem', alignSelf: 'center', flexShrink: 0 }}>
            {chartId && (
              <>
                <Tooltip title="Zoom back">
                  <span>
                    <ChartToolbarButton
                      variant="outlined"
                      size="small"
                      sx={{
                        ...(textColor ? { color: textColor, borderColor: textColor } : {}),
                        minWidth: 'auto',
                        px: 1,
                      }}
                      onClick={() => zoomBack(chartId)}
                      disabled={!canZoomBack}
                      aria-label="Zoom back"
                    >
                      <UndoIcon sx={{ fontSize: '1.1rem' }} />
                    </ChartToolbarButton>
                  </span>
                </Tooltip>
                <Tooltip title="Reset to basic zoom">
                  <ChartToolbarButton
                    variant="outlined"
                    size="small"
                    sx={{
                      ...(textColor ? { color: textColor, borderColor: textColor } : {}),
                      minWidth: 'auto',
                      px: 1,
                    }}
                    onClick={() => zoomReset(chartId)}
                    aria-label="Reset to basic zoom"
                  >
                    <LogoIcon sx={{ fontSize: '1.1rem' }} />
                  </ChartToolbarButton>
                </Tooltip>
              </>
            )}
            {showDisableAllButton && (
              <Tooltip title={seriesVisibility.every((v) => !v) ? 'Enable all' : 'Disable all'}>
                <ChartToolbarButton
                  variant="outlined"
                  size="small"
                  sx={{
                    ...(textColor ? { color: textColor, borderColor: textColor } : {}),
                    minWidth: 'auto',
                    px: 1,
                  }}
                  onClick={handleDisableAll}
                  aria-label={seriesVisibility.every((v) => !v) ? 'Enable all' : 'Disable all'}
                >
                  {seriesVisibility.every((v) => !v) ? <VisibilityIcon sx={{ fontSize: '1.1rem' }} /> : <VisibilityOffIcon sx={{ fontSize: '1.1rem' }} />}
                </ChartToolbarButton>
              </Tooltip>
            )}
          </Box>
        </ChartPanelHeader>
      )}
      <Chart
        data={data}
        options={mergedOptions}
        style={style ?? { width: '100%', height: '100%', flex: 1, minHeight: 0 }}
        lines={lines}
        chartId={chartId}
      />
    </ChartWrapperBox>
  )
}
