import type { ResolvedSciChartDefinition, SciChartDataBounds } from '../scichartOptions';

import { useDataSeriesSync } from './useDataSeriesSync';
import { useIconsSync } from './useIconsSync';
import { useSciChartSurfaceContext } from './useSciChartSurfaceContext';
import { useSeriesVisibilitySync } from './useSeriesVisibilitySync';
import { useShapesSync } from './useShapesSync';
import { useZoomResetSync } from './useZoomResetSync';

const DEFAULT_ICON_SIZE = 1;

export interface UseSciChartRuntimeSyncOptions {
  definition: ResolvedSciChartDefinition;
  dataBounds: SciChartDataBounds;
}

export const useSciChartRuntimeSync = ({
  definition,
  dataBounds,
}: UseSciChartRuntimeSyncOptions) => {
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
    defaultColor: definition.styles.defaultStyles.iconColor,
    iconSize: DEFAULT_ICON_SIZE,
  });
  useSeriesVisibilitySync(sciChartSurface, definition.data.seriesVisibility);
  useShapesSync({
    surface: sciChartSurface,
    shapes: definition.shapes,
    dataBounds,
  });
};
