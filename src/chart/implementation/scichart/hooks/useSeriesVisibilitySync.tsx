import { useEffect } from 'react';
import { SciChartSurface } from 'scichart';

export function useSeriesVisibilitySync(
  seriesVisibility: boolean[] | undefined,
  surface: SciChartSurface | undefined
) {

  useEffect(() => {
    if (!surface) return;
    const series = surface.renderableSeries.asArray();
    for (let index = 0; index < series.length; index++) {
      const visible = seriesVisibility ? (seriesVisibility[index] ?? true) : true;
      (series[index] as { isVisible: boolean }).isVisible = visible;
    }
    surface.invalidateElement();
  }, [surface, seriesVisibility]);
}
