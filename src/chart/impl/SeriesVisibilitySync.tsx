import { useContext, useEffect } from 'react'
import { SciChartSurface } from 'scichart'
import { SciChartSurfaceContext } from 'scichart-react'

interface SeriesVisibilitySyncProps {
  seriesVisibility?: boolean[]
}

export const SeriesVisibilitySync = ({ seriesVisibility }: SeriesVisibilitySyncProps) => {
  const initResult = useContext(SciChartSurfaceContext)

  useEffect(() => {
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined
    if (!surface) return
    const series = surface.renderableSeries.asArray()
    for (let i = 0; i < series.length; i++) {
      const visible = seriesVisibility ? (seriesVisibility[i] ?? true) : true
      ;(series[i] as { isVisible: boolean }).isVisible = visible
    }
    surface.invalidateElement()
  }, [initResult, seriesVisibility])

  return null
}
