import type { ChartIcon } from '../../../types'
import type { ChartZoomCallbacks } from '../../implementationProps'
import type { ConvertedBox, ConvertedData, ConvertedShape } from '../convert'

import { useIconsSync } from './useIconsSync'
import { useSeriesVisibilitySync } from './useSeriesVisibilitySync'
import { useShapesSync } from './useShapesSync'
import { useZoomResetSync } from './useZoomResetSync'

export interface UseSciChartRuntimeSyncOptions {
  zoomCallbacks?: ChartZoomCallbacks
  icons: ChartIcon[]
  defaultColor: string
  iconSize: number
  seriesVisibility?: boolean[]
  lineShapes: ConvertedShape[]
  boxes: ConvertedBox[]
  data: ConvertedData
}

export const useSciChartRuntimeSync = ({
  zoomCallbacks,
  icons,
  defaultColor,
  iconSize,
  seriesVisibility,
  lineShapes,
  boxes,
  data,
}: UseSciChartRuntimeSyncOptions) => {
  useZoomResetSync(zoomCallbacks)
  useIconsSync({
    icons,
    defaultColor,
    iconSize,
  })
  useSeriesVisibilitySync(seriesVisibility)
  useShapesSync({
    lineShapes,
    boxes,
    data,
  })
}
