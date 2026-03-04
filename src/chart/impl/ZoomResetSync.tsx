import { useContext, useEffect } from 'react'
import { SciChartSurface } from 'scichart'
import { SciChartSurfaceContext } from 'scichart-react'
import { useZoomBackStore } from '../../store/zoomBackStore'
import { useZoomResetStore } from '../../store/zoomResetStore'

interface ZoomResetSyncProps {
  chartId?: string
}

export const ZoomResetSync = ({ chartId }: ZoomResetSyncProps) => {
  const initResult = useContext(SciChartSurfaceContext)

  useEffect(() => {
    if (!chartId) return
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined
    if (!surface) return

    const unregister = useZoomResetStore.getState().register(chartId, () => {
      useZoomBackStore.getState().pushBeforeReset(chartId)
      surface.zoomExtents()
    })
    return unregister
  }, [chartId, initResult?.sciChartSurface])

  return null
}
