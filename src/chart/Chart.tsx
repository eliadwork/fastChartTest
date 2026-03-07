/**
 * Chart – Generic facade. Owns header, legend, series visibility, ChartData conversion.
 * Delegates to SciChartWrapper. No SciChart imports.
 */

import type { ChartData } from './types'
import type { SciChartWrapperStyle, SciChartWrapperOptionsOverrides } from './implementation/scichart/types'
import type { ChartOptionsInput } from './chartTypes'

export interface ChartProps {
  data: ChartData | null
  chartId?: string
  title?: string
  options?: ChartOptionsInput
  style?: React.CSSProperties
  icons?: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>
  /** Optional style override. When absent, built from chartTheme. */
  chartStyle?: SciChartWrapperStyle
  /** Called when series visibility changes (e.g. for Detect modal sync). */
  onSeriesVisibilityChange?: (visibility: boolean[]) => void
}

import { memo } from 'react'
import Tooltip from '@mui/material/Tooltip'
import { useChartTheme } from '../ChartThemeContext'
import { withOpacity } from '../chartTheme'
import { SciChartWrapper } from './implementation/scichart'
import { Legend } from './Legend'
import { DEFAULT_LEGEND_BACKGROUND_COLOR } from './defaults'
import {
  ChartPanelHeader,
  ChartPanelHeaderText,
  ChartPanelTitle,
  ChartPanelNote,
  ChartToolbarButton,
  ChartWrapperBox,
} from '../styled'
import { LogoIcon } from '../assets/pointMarkIcon'
import UndoIcon from '@mui/icons-material/Undo'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useZoomBackStore } from '../store/zoomBackStore'
import { useZoomResetStore } from '../store/zoomResetStore'
import { useChartSeriesVisibility } from './hooks/useChartSeriesVisibility'
import { useChartWrapperStyle } from './hooks/useChartWrapperStyle'
import { useChartWrapperOptions } from './hooks/useChartWrapperOptions'
import { ChartToolbar } from './ChartStyled'
import {
  CHART_LEGEND_BACKGROUND_OPACITY,
  CHART_TOOLTIP_ZOOM_BACK,
  CHART_TOOLTIP_ZOOM_RESET,
  CHART_TOOLTIP_DISABLE_ALL,
  CHART_TOOLTIP_ENABLE_ALL,
  CHART_ARIA_ZOOM_BACK,
  CHART_ARIA_ZOOM_RESET,
  CHART_ARIA_DISABLE_ALL,
  CHART_ARIA_ENABLE_ALL,
  CHART_TOOLBAR_ICON_SIZE,
} from './chartConstants'

export type { ChartOptionsInput }

const ChartComponent = ({
  data,
  chartId,
  title,
  options = {},
  style,
  icons,
  chartStyle,
  onSeriesVisibilityChange,
}: ChartProps) => {
  const chartTheme = useChartTheme()
  const zoomBack = useZoomBackStore((store) => store.zoomBack)
  const canZoomBack = useZoomBackStore((store) => store.canZoomBackFor(chartId ?? ''))
  const zoomReset = useZoomResetStore((store) => store.zoomReset)

  const chartData = data ?? []
  const seriesCount = chartData.length

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
  const showHeader = !wrapperStyle.chartOnly && (title != null || options.note != null || chartId != null)

  const legendBackgroundColor = chartTheme.backgroundColor
    ? withOpacity(chartTheme.backgroundColor, chartTheme.legendBackgroundOpacity ?? CHART_LEGEND_BACKGROUND_OPACITY)
    : DEFAULT_LEGEND_BACKGROUND_COLOR

  const legendOverlay =
    !wrapperStyle.chartOnly &&
    (data != null ? (
      <Legend
        backgroundColor={legendBackgroundColor}
        textColor={textColor}
        seriesVisibility={seriesVisibility}
        seriesGroupKeys={options.seriesGroupKeys ?? chartData.map((series) => series.lineGroupKey)}
        onSeriesVisibilityChange={handleSeriesVisibilityChange}
        onSeriesVisibilityGroupChange={handleSeriesVisibilityGroupChange}
      />
    ) : null)

  const toolbarButtonSx = textColor ? { color: textColor, borderColor: textColor } : {}

  return (
    <ChartWrapperBox>
      {showHeader && (
        <ChartPanelHeader
          sx={{
            ...(chartTheme.backgroundColor ? { backgroundColor: chartTheme.backgroundColor } : {}),
            ...(textColor ? { color: textColor } : {}),
          }}
        >
          <ChartPanelHeaderText>
            {title != null && <ChartPanelTitle variant="subtitle1">{title}</ChartPanelTitle>}
            {options.note != null && <ChartPanelNote variant="body2">{options.note}</ChartPanelNote>}
          </ChartPanelHeaderText>
          {chartId && (
            <ChartToolbar>
              <Tooltip title={CHART_TOOLTIP_ZOOM_BACK}>
                <span>
                  <ChartToolbarButton
                    variant="outlined"
                    size="small"
                    sx={{ ...toolbarButtonSx, minWidth: 'auto', px: 1 }}
                    onClick={() => zoomBack(chartId)}
                    disabled={!canZoomBack}
                    aria-label={CHART_ARIA_ZOOM_BACK}
                  >
                    <UndoIcon sx={{ fontSize: CHART_TOOLBAR_ICON_SIZE }} />
                  </ChartToolbarButton>
                </span>
              </Tooltip>
              <Tooltip title={CHART_TOOLTIP_ZOOM_RESET}>
                <ChartToolbarButton
                  variant="outlined"
                  size="small"
                  sx={{ ...toolbarButtonSx, minWidth: 'auto', px: 1 }}
                  onClick={() => zoomReset(chartId)}
                  aria-label={CHART_ARIA_ZOOM_RESET}
                >
                  <LogoIcon sx={{ fontSize: CHART_TOOLBAR_ICON_SIZE }} />
                </ChartToolbarButton>
              </Tooltip>
              <Tooltip title={allSeriesHidden ? CHART_TOOLTIP_ENABLE_ALL : CHART_TOOLTIP_DISABLE_ALL}>
                <ChartToolbarButton
                  variant="outlined"
                  size="small"
                  sx={{ ...toolbarButtonSx, minWidth: 'auto', px: 1 }}
                  onClick={handleDisableAll}
                  aria-label={allSeriesHidden ? CHART_ARIA_ENABLE_ALL : CHART_ARIA_DISABLE_ALL}
                >
                  {allSeriesHidden ? (
                    <VisibilityIcon sx={{ fontSize: CHART_TOOLBAR_ICON_SIZE }} />
                  ) : (
                    <VisibilityOffIcon sx={{ fontSize: CHART_TOOLBAR_ICON_SIZE }} />
                  )}
                </ChartToolbarButton>
              </Tooltip>
            </ChartToolbar>
          )}
        </ChartPanelHeader>
      )}
      <SciChartWrapper
        chartId={chartId}
        data={chartData}
        style={wrapperStyle}
        options={wrapperOptions as SciChartWrapperOptionsOverrides}
        containerStyle={style}
        overlaySlot={legendOverlay ?? undefined}
        loading={data == null}
      />
    </ChartWrapperBox>
  )
}

export const Chart = memo(ChartComponent)
