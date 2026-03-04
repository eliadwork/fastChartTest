import { memo } from 'react'
import type { ChartProps } from './types'
import { convertData } from './convert'
import { SciChartChart } from './impl/SciChartChart'

const ChartComponent = ({ data, options = {}, style, lines, chartId }: ChartProps) => {
  const convertedData = convertData(data, options, lines)
  return <SciChartChart data={convertedData} options={options} style={style} chartId={chartId} />
}

export const Chart = memo(ChartComponent)
