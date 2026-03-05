/**
 * Chart – Generic facade. Owns header, legend, series visibility, ChartData conversion.
 * Delegates to SciChartWrapper. No SciChart imports.
 */

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { useChartTheme } from '../ChartThemeContext'
import { withOpacity } from '../chartTheme'
import { SciChartWrapper, LegendWithToggle, DEFAULT_LEGEND_BACKGROUND_COLOR } from './scichart'
import type { ChartData, ChartOptions } from './types'
import { convertData } from './convert'
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
import type { SciChartWrapperStyle, SciChartWrapperOptions, SciChartWrapperOptionsOverrides } from './scichart'

/** Accepts ChartOptions (legacy flat) or SciChartWrapperOptionsOverrides (nested). */
export type ChartOptionsInput = Omit<ChartOptions, 'resampling'> &
  Omit<SciChartWrapperOptionsOverrides, 'resampling'> & {
    resampling?: boolean | SciChartWrapperOptions['resampling']
  }

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

  const convertedData = useMemo(
    () => (data ? convertData(data, options) : { series: [], seriesBindable: [] }),
    [data, options]
  )
  const lines = convertedData.series
  const seriesCount = lines.length

  const [seriesVisibility, setSeriesVisibility] = useState<boolean[]>(
    () => options.seriesVisibility ?? Array.from({ length: seriesCount }, () => true)
  )

  useEffect(() => {
    setSeriesVisibility((prev) => {
      if (prev.length === seriesCount) return prev
      if (prev.length < seriesCount)
        return [...prev, ...Array.from({ length: seriesCount - prev.length }, () => true)]
      return prev.slice(0, seriesCount)
    })
  }, [seriesCount])

  const handleDisableAll = useCallback(() => {
    setSeriesVisibility((prev) => {
      const next = prev.every((visible) => !visible) ? prev.map(() => true) : prev.map(() => false)
      onSeriesVisibilityChange?.(next)
      return next
    })
  }, [onSeriesVisibilityChange])

  const handleSeriesVisibilityChange = useCallback(
    (index: number, visible: boolean) => {
      setSeriesVisibility((prev) => {
        const next = [...prev]
        if (index >= 0 && index < next.length) next[index] = visible
        options.onSeriesVisibilityChange?.(index, visible)
        const result = next
        onSeriesVisibilityChange?.(result)
        return result
      })
    },
    [options.onSeriesVisibilityChange, onSeriesVisibilityChange]
  )

  const handleSeriesVisibilityGroupChange = useCallback(
    (indices: number[], visible: boolean) => {
      setSeriesVisibility((prev) => {
        const next = [...prev]
        for (const index of indices) {
          if (index >= 0 && index < next.length) next[index] = visible
        }
        options.onSeriesVisibilityGroupChange?.(indices, visible)
        onSeriesVisibilityChange?.(next)
        return next
      })
    },
    [options.onSeriesVisibilityGroupChange, onSeriesVisibilityChange]
  )

  const wrapperStyle = useMemo<SciChartWrapperStyle>(
    () =>
      chartStyle ?? {
        backgroundColor:
          chartTheme.backgroundColor != null
            ? withOpacity(chartTheme.backgroundColor, chartTheme.chartBackgroundOpacity ?? 0.2)
            : (chartTheme.backgroundColor ?? '#1a1a1a'),
        rollover: {
          show: true,
          color: chartTheme.rolloverStroke ?? '#FF0000',
          dash: chartTheme.rolloverDash ?? { isDash: true, steps: [8, 4] },
        },
        textColor: chartTheme.textColor ?? options.textColor ?? '#ffffff',
        zeroLineColor: chartTheme.zeroLineColor ?? options.zeroLineColor,
        chartOnly: false,
      },
    [chartStyle, chartTheme, options.textColor, options.zeroLineColor]
  )

  const wrapperOptions = useMemo(
    (): SciChartWrapperOptionsOverrides => {
      const opts = options as ChartOptionsInput
      const resamplingObj =
        opts.resampling && typeof opts.resampling === 'object'
          ? opts.resampling
          : {
              enable: opts.resampling !== false,
              precision: (opts as ChartOptions).resamplingPrecision ?? (opts.resampling ? 1 : 0),
            }
      return {
        shapes: opts.shapes,
        icons: icons ?? opts.icons,
        note: opts.note,
        stretch: opts.stretch ?? {
          enable: true,
          trigger: ((opts as ChartOptions).stretchTrigger ?? 'rightClick') as SciChartWrapperOptions['stretch']['trigger'],
        },
        pan: opts.pan ?? {
          enable: true,
          trigger: ((opts as ChartOptions).panTrigger ?? (opts as ChartOptions).panKey ?? 'shift') as SciChartWrapperOptions['pan']['trigger'],
        },
        resampling: resamplingObj,
        clipZoomToData: opts.clipZoomToData !== false,
        seriesVisibility,
        seriesGroupKeys: opts.seriesGroupKeys,
        onSeriesVisibilityChange: handleSeriesVisibilityChange,
        onSeriesVisibilityGroupChange: handleSeriesVisibilityGroupChange,
        onDisableAll: handleDisableAll,
        events: opts.events ?? { onmiddleclick: (opts as ChartOptions).onPointMark },
      }
    },
    [
      options,
      icons,
      seriesVisibility,
      handleSeriesVisibilityChange,
      handleSeriesVisibilityGroupChange,
      handleDisableAll,
    ]
  )

  const textColor = wrapperStyle.textColor
  const showHeader = !wrapperStyle.chartOnly && (title != null || options.note != null || chartId != null)
  const allSeriesHidden = seriesVisibility.length > 0 && seriesVisibility.every((visible) => !visible)

  const legendOverlay =
    !wrapperStyle.chartOnly &&
    (data != null ? (
      <LegendWithToggle
        backgroundColor={
          chartTheme.backgroundColor
            ? withOpacity(chartTheme.backgroundColor, 0.08)
            : DEFAULT_LEGEND_BACKGROUND_COLOR
        }
        textColor={textColor}
        seriesVisibility={seriesVisibility}
        seriesGroupKeys={options.seriesGroupKeys ?? lines.map((series) => series.lineGroupKey)}
        onSeriesVisibilityChange={handleSeriesVisibilityChange}
        onSeriesVisibilityGroupChange={handleSeriesVisibilityGroupChange}
      />
    ) : null)

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
            <Box sx={{ display: 'flex', gap: '0.5rem', alignSelf: 'center', flexShrink: 0 }}>
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
              <Tooltip title={allSeriesHidden ? 'Enable all' : 'Disable all'}>
                <ChartToolbarButton
                  variant="outlined"
                  size="small"
                  sx={{
                    ...(textColor ? { color: textColor, borderColor: textColor } : {}),
                    minWidth: 'auto',
                    px: 1,
                  }}
                  onClick={handleDisableAll}
                  aria-label={allSeriesHidden ? 'Enable all' : 'Disable all'}
                >
                  {allSeriesHidden ? (
                    <VisibilityIcon sx={{ fontSize: '1.1rem' }} />
                  ) : (
                    <VisibilityOffIcon sx={{ fontSize: '1.1rem' }} />
                  )}
                </ChartToolbarButton>
              </Tooltip>
            </Box>
          )}
        </ChartPanelHeader>
      )}
      <SciChartWrapper
        chartId={chartId}
        lines={lines}
        style={wrapperStyle}
        options={wrapperOptions}
        containerStyle={style}
        overlaySlot={legendOverlay ?? undefined}
        loading={data == null}
      />
    </ChartWrapperBox>
  )
}

export const Chart = memo(ChartComponent)
