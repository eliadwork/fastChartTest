import { useMemo, useState } from 'react'
import { Chart } from './chart'
import type { ChartData, ChartOptions, ChartLineStyle } from './chart'
import { useChartTheme } from './ChartThemeContext'
import { ChartPanelHeader, ChartPanelTitle, ChartToolbarButton, ChartWrapperBox } from './styled'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'

const DEFAULT_OPTIONS: ChartOptions = {
  stretchTrigger: 'Ctrl',
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
      backgroundColor: chartTheme.backgroundColor,
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

  const showHeader = title != null || showDisableAllButton

  return (
    <ChartWrapperBox>
      {showHeader && (
        <ChartPanelHeader>
          {title != null && <ChartPanelTitle variant="subtitle1">{title}</ChartPanelTitle>}
          {showDisableAllButton && (
            <ChartToolbarButton
              variant="outlined"
              size="small"
              startIcon={allGraphsDisabled ? <VisibilityIcon /> : <VisibilityOffIcon />}
              onClick={() => setAllGraphsDisabled((v) => !v)}
            >
              {allGraphsDisabled ? 'Enable all' : 'Disable all'}
            </ChartToolbarButton>
          )}
        </ChartPanelHeader>
      )}
      <Chart
        data={data}
        options={mergedOptions}
        style={style ?? { width: '100%', height: '100%', flex: 1, minHeight: 0 }}
        lines={lines}
      />
    </ChartWrapperBox>
  )
}
