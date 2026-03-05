import { memo } from 'react'
import type { ChartData, ChartOptions } from './types'
import { convertData } from './convert'
import { SciChartChart } from './impl/SciChartChart'

export interface ChartProps {
  data: ChartData
  options?: ChartOptions
  style?: React.CSSProperties
  chartId?: string
}

const ChartComponent = ({ data, options = {}, style, chartId }: ChartProps) => {
  const convertedData = convertData(data, options)
  return <SciChartChart data={convertedData} options={options} style={style} chartId={chartId} />
}

export const Chart = memo(ChartComponent)
