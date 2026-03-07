import type { ChartIcon } from '../../../types'
import type { ChartZoomCallbacks } from '../../implementationProps'
import type { ConvertedBox, ConvertedData, ConvertedShape } from '../convert'
import { usePointMarkersSync } from './usePointMarkersSync'
import { useSeriesVisibilitySync } from './useSeriesVisibilitySync'
import { useShapesSync } from './useShapesSync'
import { useZoomResetSync } from './useZoomResetSync'

export interface UseSciChartSyncHooksParams {
  zoomCallbacks?: ChartZoomCallbacks
  icons: ChartIcon[]
  defaultIcon: string
  defaultColor: string
  iconSize: number
  seriesVisibility?: boolean[]
  lineShapes: ConvertedShape[]
  boxes: ConvertedBox[]
  data: ConvertedData
}

/** Runs zoom, point markers, visibility, and shapes sync. Must be called from a component inside SciChartReact. */
export const useSciChartSyncHooks = (params: UseSciChartSyncHooksParams) => {
  useZoomResetSync(params.zoomCallbacks)
  usePointMarkersSync({
    icons: params.icons,
    defaultIcon: params.defaultIcon,
    defaultColor: params.defaultColor,
    iconSize: params.iconSize,
  })
  useSeriesVisibilitySync(params.seriesVisibility)
  useShapesSync({
    lineShapes: params.lineShapes,
    boxes: params.boxes,
    data: params.data,
  })
}
