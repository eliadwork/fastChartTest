import { memo } from 'react'
import type { ChartData, ChartOptions, ChartLineStyle } from './types'
import { convertData } from './convert'
import { SciChartChart } from './impl/SciChartChart'

export interface ChartProps {
  data: ChartData
  options?: ChartOptions
  style?: React.CSSProperties
  lines?: ChartLineStyle[]
  chartId?: string
}

const ChartComponent = ({ data, options = {}, style, lines, chartId }: ChartProps) => {
  const convertedData = convertData(data, options, lines)
  return <SciChartChart data={convertedData} options={options} style={style} chartId={chartId} />
}

export const Chart = memo(ChartComponent)
