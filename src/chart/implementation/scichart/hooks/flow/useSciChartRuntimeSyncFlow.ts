import type { ResolvedSciChartDefinition, SciChartDataBounds } from '../../scichartOptions';

import { useSciChartSurfaceContext } from '../context/useSciChartSurfaceContext';
import { useDataSeriesSync } from '../sync/useDataSeriesSync';
import { useIconsSync } from '../sync/useIconsSync';
import { useSeriesVisibilitySync } from '../sync/useSeriesVisibilitySync';
import { useShapesSync } from '../sync/useShapesSync';
import { useZoomResetSync } from '../sync/useZoomResetSync';

export interface UseSciChartRuntimeSyncFlowOptions {
  definition: ResolvedSciChartDefinition;
  dataBounds: SciChartDataBounds;
}

export const useSciChartRuntimeSyncFlow = ({
  definition,
  dataBounds,
}: UseSciChartRuntimeSyncFlowOptions) => {
  const { sciChartSurface } = useSciChartSurfaceContext();

  const zoomCallbacks = definition.options.events?.zoom;

  useZoomResetSync(sciChartSurface, zoomCallbacks);
  useDataSeriesSync({
    surface: sciChartSurface,
    data: definition.data,
    dataBounds,
    clipZoomToData: definition.options.clipZoomToData,
    seriesConfig: definition.options.resampling,
    seriesVisibility: definition.data.seriesVisibility,
  });
  useIconsSync({
    surface: sciChartSurface,
    icons: definition.icons,
  });
  useSeriesVisibilitySync(sciChartSurface, definition.data.seriesVisibility);
  useShapesSync({
    surface: sciChartSurface,
    shapes: definition.shapes,
    dataBounds,
  });
};
