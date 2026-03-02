import { useMemo } from 'react'
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
  data: ChartData
  options?: ChartOptions
  style?: React.CSSProperties
  lines?: ChartLineStyle[]
  /** Default line thickness for all series. Override per-series via lines[].thickness */
  defaultLineThickness?: number
}

export function ChartWrapper({ data, options = {}, style, lines, defaultLineThickness }: ChartWrapperProps) {
  const mergedOptions = useMemo(
    () => ({
      ...DEFAULT_OPTIONS,
      ...options,
      defaultStrokeThickness: defaultLineThickness ?? options.defaultStrokeThickness ?? 2,
      seriesLines: lines ?? options.seriesLines,
    }),
    [options, lines, defaultLineThickness]
  )

  return (
    <Chart
      data={data}
      options={mergedOptions}
      style={style ?? { width: '100%', height: '100%' }}
      lines={lines}
    />
  )
}
