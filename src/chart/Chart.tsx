import { memo } from 'react'
import type { ChartProps } from './types'
import { convertData } from './convert'
import { SciChartChart } from './impl/SciChartChart'

function ChartComponent({ data, options = {}, style, lines }: ChartProps) {
  const convertedData = convertData(data, options, lines)
  return <SciChartChart data={convertedData} options={options} style={style} />
}

export const Chart = memo(ChartComponent)
