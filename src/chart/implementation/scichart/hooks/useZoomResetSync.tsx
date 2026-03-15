import { useEffect } from 'react';
import { SciChartSurface } from 'scichart';
import type { sciChartZoomCallbacks } from '../scichartOptions';

export const useZoomResetSync = (
  zoomCallbacks: sciChartZoomCallbacks | undefined,
  surface: SciChartSurface | undefined
) => {
  useEffect(() => {
    if (!zoomCallbacks) return;
    if (!surface) return;

    zoomCallbacks.setZoomReset(() => {
      zoomCallbacks.pushBeforeResetRef.current?.();
      surface.zoomExtents();
    });
    return () => {
      zoomCallbacks.setZoomReset(() => {});
    };
  }, [zoomCallbacks, surface]);
};
