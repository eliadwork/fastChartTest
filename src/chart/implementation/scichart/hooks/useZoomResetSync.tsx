import { useContext, useEffect } from 'react';
import { SciChartSurface } from 'scichart';
import { SciChartSurfaceContext } from 'scichart-react';
import type { ChartZoomCallbacks } from '../../implementationProps';

export const useZoomResetSync = (zoomCallbacks: ChartZoomCallbacks | undefined) => {
  const initResult = useContext(SciChartSurfaceContext);

  useEffect(() => {
    if (!zoomCallbacks) return;
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined;
    if (!surface) return;

    zoomCallbacks.setZoomReset(() => {
      zoomCallbacks.pushBeforeResetRef.current?.();
      surface.zoomExtents();
    });
    return () => {
      zoomCallbacks.setZoomReset(() => {});
    };
  }, [zoomCallbacks, initResult?.sciChartSurface]);
};
