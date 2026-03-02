import { useMemo, useState } from 'react'
import { Chart } from './chart'
import type { ChartData, ChartOptions, ChartLineStyle } from './chart'

const DEFAULT_OPTIONS: ChartOptions = {
  stretchTrigger: 'Ctrl',
  panTrigger: 'Shift',
  rolloverStroke: '#FF0000',
  rolloverDash: [8, 4],
  clipZoomToData: true,
  defaultSeriesColors: [
    '#3ca832',
    '#eb911c',
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
  ],
  defaultStrokeThickness: 2,
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
  const [allGraphsDisabled, setAllGraphsDisabled] = useState(false)
  const seriesCount = (data.ys ?? data.series ?? []).length

  const mergedOptions = useMemo(
    () => ({
      ...DEFAULT_OPTIONS,
      ...options,
      defaultStrokeThickness: defaultLineThickness ?? options.defaultStrokeThickness ?? 2,
      seriesLines: lines ?? options.seriesLines,
      icons: icons ?? options.icons,
      pointMarkers: pointMarkers ?? options.pointMarkers,
      seriesVisibility:
        options.seriesVisibility ??
        (allGraphsDisabled ? Array.from({ length: seriesCount }, () => false) : undefined),
    }),
    [options, lines, defaultLineThickness, icons, pointMarkers, allGraphsDisabled, seriesCount]
  )

  const showHeader = title != null || showDisableAllButton

  return (
    <div className="chart-wrapper">
      {showHeader && (
        <div className="chart-panel-header">
          {title != null && <h3>{title}</h3>}
          {showDisableAllButton && (
            <button
              type="button"
              className="chart-toolbar-btn"
              onClick={() => setAllGraphsDisabled((v) => !v)}
            >
              {allGraphsDisabled ? 'Enable all' : 'Disable all'}
            </button>
          )}
        </div>
      )}
      <Chart
        data={data}
        options={mergedOptions}
        style={style ?? { width: '100%', height: '100%', flex: 1, minHeight: 0 }}
        lines={lines}
      />
    </div>
  )
}
