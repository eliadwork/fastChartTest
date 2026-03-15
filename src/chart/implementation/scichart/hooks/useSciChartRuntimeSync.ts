import type { SciChartDataBounds, scichartFullDefinition } from '../scichartOptions'
import type { sciChartShape } from '../scichartOptions'

import { useIconsSync } from './useIconsSync'
import { useSeriesVisibilitySync } from './useSeriesVisibilitySync'
import { useShapesSync } from './useShapesSync'
import { useSciChartSurfaceContext } from './useSciChartSurfaceContext'
import { useZoomResetSync } from './useZoomResetSync'

export interface UseSciChartRuntimeSyncOptions {
  definition: scichartFullDefinition
  shapes: sciChartShape[]
  dataBounds: SciChartDataBounds
}

export const useSciChartRuntimeSync = ({
  definition,
  shapes,
  dataBounds,
}: UseSciChartRuntimeSyncOptions) => {
  const surface = useSciChartSurfaceContext()

  useZoomResetSync(definition.options.events?.zoom, surface)
  useIconsSync({
    surface,
    icons: definition.icons,
    defaultColor: definition.styles.defaultStyles.iconColor,
    iconSize: 1,
  })
  useSeriesVisibilitySync(definition.data.seriesVisibility, surface)
  useShapesSync({
    surface,
    shapes,
    dataBounds,
  })
}
