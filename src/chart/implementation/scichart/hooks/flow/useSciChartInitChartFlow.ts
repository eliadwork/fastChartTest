import type { ResolvedSciChartDefinition, SciChartDataBounds } from '../../scichartOptions';

import { useMemo } from 'react';
import { createSciChartModifiers } from '../internal/sciChartModifierFactory';
import { applyVisibleRangeLimits } from '../internal/sciChartRangeLimits';
import { rebuildRenderableSeries } from '../internal/sciChartSeriesRuntime';
import { createSciChartSurfaceWithAxes } from '../internal/sciChartSurfaceSetup';
import { addZeroLineAnnotations } from '../internal/sciChartZeroLines';

export interface UseSciChartInitChartFlowOptions {
  definition: ResolvedSciChartDefinition;
  dataBounds: SciChartDataBounds;
}

export const useSciChartInitChartFlow = ({
  definition,
  dataBounds,
}: UseSciChartInitChartFlowOptions) => {
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
        seriesConfig: definition.options.resampling,
      });

      addZeroLineAnnotations(sciChartSurface, definition.styles.zeroLineColor);

      const modifiers = createSciChartModifiers({
        interactionOptions: definition.options,
      });

      for (const modifier of modifiers) {
        sciChartSurface.chartModifiers.add(modifier);
      }

      return { sciChartSurface };
    },
    [definition, dataBounds]
  );
};
