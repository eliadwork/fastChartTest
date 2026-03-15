import { useContext } from 'react'
import { SciChartSurface } from 'scichart'
import { SciChartSurfaceContext } from 'scichart-react'

export const useSciChartSurfaceContext = (): SciChartSurface => {
  const initResult = useContext(SciChartSurfaceContext)

  if (initResult == null || initResult.sciChartSurface == null) {
    throw new Error(
      'useSciChartSurfaceContext must be used within an initialized SciChartReact provider'
    )
  }

  return initResult.sciChartSurface as SciChartSurface
}
