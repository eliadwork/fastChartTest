import { useEffect } from 'react';
import { SciChartSurface } from 'scichart';

export function useSeriesVisibilitySync(
  surface: SciChartSurface | undefined,
  seriesVisibility: boolean[]
) {
  useEffect(() => {
    if (!surface) return;
    const series = surface.renderableSeries.asArray();
    for (let index = 0; index < series.length; index++) {
      (series[index] as { isVisible: boolean }).isVisible = seriesVisibility[index];
    }
    surface.invalidateElement();
  }, [surface, seriesVisibility]);
}
