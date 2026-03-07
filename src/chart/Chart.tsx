/**
 * Chart – Generic facade. Owns header, legend, series visibility.
 * Delegates to implementation. No implementation-specific imports.
 */

import type { ChartData, ChartIcon, ChartStyle } from './types'
import type { ChartOptionsInput } from './chartTypes'
import { memo } from 'react'
import UndoIcon from '@mui/icons-material/Undo'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
  ChartPanelHeader,
  ChartPanelHeaderText,
  ChartPanelNote,
  ChartPanelTitle,
  ChartWrapperBox,
} from '../styled'
import { ChartToolbarButton } from './ChartToolbarButton'
import { LogoIcon } from '../assets/pointMarkIcon'
import { Legend } from './Legend'
import { SciChartWrapper } from './implementation/scichart'
import {
  CHART_TOOLTIP_DISABLE_ALL,
  CHART_TOOLTIP_ENABLE_ALL,
  CHART_TOOLTIP_ZOOM_BACK,
  CHART_TOOLTIP_ZOOM_RESET,
} from './chartConstants'
import { ChartToolbar } from './ChartStyled'
import { useChart } from './hooks/useChart'

export interface ChartProps {
  data: ChartData | null
  chartId?: string
  title?: string
  options?: ChartOptionsInput
  style?: React.CSSProperties
  icons?: ChartIcon[]
  /** Optional style override. When absent, built from chartTheme. */
  chartStyle?: ChartStyle
  /** Called when series visibility changes (e.g. for Detect modal sync). */
  onSeriesVisibilityChange?: (visibility: boolean[]) => void
}

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
  const {
    chartData,
    wrapperStyle,
    wrapperOptions,
    zoomCallbacks,
    showHeader,
    headerSx,
    legendOverlay,
    toolbarButtonSx,
    zoomBackRef,
    zoomResetRef,
    canZoomBack,
    handleDisableAll,
    allSeriesHidden,
    loading,
  } = useChart({
    data,
    chartId,
    title,
    options,
    icons,
    chartStyle,
    onSeriesVisibilityChange,
  })


  return (
    <ChartWrapperBox>
      {showHeader && (
        <ChartPanelHeader sx={headerSx}>
          <ChartPanelHeaderText>
            {title != null && <ChartPanelTitle variant="subtitle1">{title}</ChartPanelTitle>}
            {options.note != null && <ChartPanelNote variant="body2">{options.note}</ChartPanelNote>}
          </ChartPanelHeaderText>
          {!loading && (
            <ChartToolbar>
              <ChartToolbarButton
                tooltip={CHART_TOOLTIP_ZOOM_BACK}
                sx={toolbarButtonSx}
                onClick={() => zoomBackRef.current?.()}
                disabled={!canZoomBack}
              >
                <UndoIcon />
              </ChartToolbarButton>
              <ChartToolbarButton
                tooltip={CHART_TOOLTIP_ZOOM_RESET}
                sx={toolbarButtonSx}
                onClick={() => zoomResetRef.current?.()}
              >
                <LogoIcon />
              </ChartToolbarButton>
              <ChartToolbarButton
                tooltip={allSeriesHidden ? CHART_TOOLTIP_ENABLE_ALL : CHART_TOOLTIP_DISABLE_ALL}
                sx={toolbarButtonSx}
                onClick={handleDisableAll}
              >
                {allSeriesHidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </ChartToolbarButton>
            </ChartToolbar>
          )}
        </ChartPanelHeader>
      )}
      <SciChartWrapper
        chartId={chartId}
        lines={chartData}
        style={wrapperStyle}
        options={wrapperOptions}
        zoomCallbacks={zoomCallbacks}
        containerStyle={style}
        overlaySlot={legendOverlay ? <Legend {...legendOverlay} /> : undefined}
        loading={loading}
      />
    </ChartWrapperBox>
  )
}

export const Chart = memo(ChartComponent)
