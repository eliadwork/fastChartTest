import { useEffect } from 'react';
import { SciChartSurface } from 'scichart';
import type { ChartZoomCallbacks } from '../../../implementationProps';

export const useZoomResetSync = (
  surface: SciChartSurface | undefined,
  zoomCallbacks: ChartZoomCallbacks | undefined
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
  }, [surface, zoomCallbacks]);
};
