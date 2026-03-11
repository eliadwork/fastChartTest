import type { ChartIcon } from '../../../types'
import type { ChartZoomCallbacks } from '../../implementationProps'
import type { ConvertedBox, ConvertedData, ConvertedShape } from '../convert'
import type { SciChartDataBounds } from './useSciChartDataBounds'
import type { SciChartSeriesConfig } from './useSciChartSeriesConfig'

import { useDataSeriesSync } from './useDataSeriesSync'
import { useIconsSync } from './useIconsSync'
import { useSeriesVisibilitySync } from './useSeriesVisibilitySync'
import { useShapesSync } from './useShapesSync'
import { useZoomResetSync } from './useZoomResetSync'

export interface UseSciChartRuntimeSyncOptions {
  zoomCallbacks?: ChartZoomCallbacks
  icons: ChartIcon[]
  defaultColor: string
  iconSize: number
  dataBounds: SciChartDataBounds
  clipZoomToData: boolean
  seriesConfig: SciChartSeriesConfig
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
  dataBounds,
  clipZoomToData,
  seriesConfig,
  seriesVisibility,
  lineShapes,
  boxes,
  data,
}: UseSciChartRuntimeSyncOptions) => {
  useZoomResetSync(zoomCallbacks)
  useDataSeriesSync({
    data,
    dataBounds,
    clipZoomToData,
    seriesConfig,
    seriesVisibility,
  })
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
