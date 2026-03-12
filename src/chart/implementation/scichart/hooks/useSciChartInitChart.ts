import type { ResolvedSciChartDefinition, SciChartDataBounds } from '../scichartOptions';

import { useMemo } from 'react';
import { createSciChartModifiers } from './internal/sciChartModifierFactory';
import { applyVisibleRangeLimits } from './internal/sciChartRangeLimits';
import { rebuildRenderableSeries } from './internal/sciChartSeriesRuntime';
import { createSciChartSurfaceWithAxes } from './internal/sciChartSurfaceSetup';
import { addZeroLineAnnotations } from './internal/sciChartZeroLines';
import { useSciChartInteractionConfig } from './useSciChartInteractionConfig';

export interface UseSciChartInitChartOptions {
  definition: ResolvedSciChartDefinition;
  dataBounds: SciChartDataBounds;
}

export const useSciChartInitChart = ({ definition, dataBounds }: UseSciChartInitChartOptions) => {
  const interactionConfig = useSciChartInteractionConfig(definition.options);

  return useMemo(
    () => async (rootElement: HTMLDivElement | string) => {
      const { sciChartSurface } = await createSciChartSurfaceWithAxes({
        rootElement,
        backgroundColor: definition.styles.backgroundColor,
        textColor: definition.styles.textColor,
      });

      applyVisibleRangeLimits(sciChartSurface, dataBounds, definition.options.clipZoomToData);

      rebuildRenderableSeries({
        surface: sciChartSurface,
        data: definition.data,
        seriesVisibility: definition.data.seriesVisibility,
        seriesConfig: definition.options.resampling,
      });

      addZeroLineAnnotations(sciChartSurface, definition.styles.zeroLineColor);

      const modifiers = createSciChartModifiers({
        interactionConfig,
        zoomCallbacks: definition.options.events?.zoom,
      });

      for (const modifier of modifiers) {
        sciChartSurface.chartModifiers.add(modifier);
      }

      return { sciChartSurface };
    },
    [definition, dataBounds, interactionConfig]
  );
};
