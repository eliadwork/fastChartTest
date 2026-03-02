import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import { Chart } from './chart'
import type { ChartData, ChartOptions, ChartLineStyle } from './chart'
import { useChartTheme } from './ChartThemeContext'
import { withOpacity } from './chartTheme'
import { ChartPanelHeader, ChartPanelHeaderText, ChartPanelTitle, ChartPanelNote, ChartToolbarButton, ChartWrapperBox } from './styled'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import UndoIcon from '@mui/icons-material/Undo'
import { useZoomBackStore } from './store/zoomBackStore'

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

export function ChartWrapper({
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
}: ChartWrapperProps) {
  const chartTheme = useChartTheme()
  const zoomBack = useZoomBackStore((s) => s.zoomBack)
  const canZoomBack = useZoomBackStore((s) => s.canZoomBackFor(chartId ?? ''))
  const [allGraphsDisabled, setAllGraphsDisabled] = useState(false)
  const seriesCount = (data.ys ?? data.series ?? []).length

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
      seriesVisibility:
        options.seriesVisibility ??
        (allGraphsDisabled ? Array.from({ length: seriesCount }, () => false) : undefined),
    }),
    [chartTheme, options, lines, defaultLineThickness, icons, pointMarkers, allGraphsDisabled, seriesCount]
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
            )}
            {showDisableAllButton && (
              <ChartToolbarButton
                variant="outlined"
                size="small"
                sx={{
                  ...(textColor ? { color: textColor, borderColor: textColor } : {}),
                }}
                startIcon={allGraphsDisabled ? <VisibilityIcon /> : <VisibilityOffIcon />}
                onClick={() => setAllGraphsDisabled((v) => !v)}
              >
                {allGraphsDisabled ? 'Enable all' : 'Disable all'}
              </ChartToolbarButton>
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
