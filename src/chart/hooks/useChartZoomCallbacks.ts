import type { ChartZoomCallbacks } from '../implementation/implementationProps';

import { useCallback, useMemo, useRef, useState } from 'react';

export const useChartZoomCallbacks = () => {
  const zoomBackRef = useRef<(() => void) | null>(null);
  const zoomResetRef = useRef<(() => void) | null>(null);
  const [canZoomBack, setCanZoomBack] = useState(false);
  const pushBeforeResetRef = useRef<(() => void) | null>(null);

  const setZoomBack = useCallback((callback: () => void) => {
    zoomBackRef.current = callback;
  }, []);

  const setZoomReset = useCallback((callback: () => void) => {
    zoomResetRef.current = callback;
  }, []);

  const setPushBeforeReset = useCallback((callback: () => void) => {
    pushBeforeResetRef.current = callback;
  }, []);

  const zoomCallbacks = useMemo<ChartZoomCallbacks>(
    () => ({
      setZoomBack,
      setZoomReset,
      setCanZoomBack,
      setPushBeforeReset,
      pushBeforeResetRef,
    }),
    [setZoomBack, setZoomReset, setPushBeforeReset]
  );

  return {
    zoomCallbacks,
    zoomBackRef,
    zoomResetRef,
    canZoomBack,
  };
};
