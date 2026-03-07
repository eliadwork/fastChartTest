import { useContext, useEffect } from 'react';
import { SciChartSurface } from 'scichart';
import { SciChartSurfaceContext } from 'scichart-react';

export function useSeriesVisibilitySync(seriesVisibility?: boolean[]) {
  const initResult = useContext(SciChartSurfaceContext);

  useEffect(() => {
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined;
    if (!surface) return;
    const series = surface.renderableSeries.asArray();
    for (let index = 0; index < series.length; index++) {
      const visible = seriesVisibility ? (seriesVisibility[index] ?? true) : true;
      (series[index] as { isVisible: boolean }).isVisible = visible;
    }
    surface.invalidateElement();
  }, [initResult, seriesVisibility]);
}
