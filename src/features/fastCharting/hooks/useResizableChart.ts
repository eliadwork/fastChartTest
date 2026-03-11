import { useCallback, useEffect, useRef, useState } from 'react';

import {
  FAST_CHARTING_DEFAULT_HEIGHT,
  FAST_CHARTING_DEFAULT_WIDTH,
  FAST_CHARTING_MIN_HEIGHT,
  FAST_CHARTING_MIN_WIDTH,
} from '../fastChartingConstants';

export interface UseResizableChartOptions {
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export const useResizableChart = ({
  initialWidth = FAST_CHARTING_DEFAULT_WIDTH,
  initialHeight = FAST_CHARTING_DEFAULT_HEIGHT,
  minWidth = FAST_CHARTING_MIN_WIDTH,
  minHeight = FAST_CHARTING_MIN_HEIGHT,
}: UseResizableChartOptions = {}) => {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const startRef = useRef<{
    clientX: number;
    clientY: number;
    width: number;
    height: number;
  } | null>(null);

  const handleMouseMove = useCallback(
    (mouseEvent: MouseEvent) => {
      const start = startRef.current;
      if (!start) {
        return;
      }

      const deltaX = mouseEvent.clientX - start.clientX;
      const deltaY = mouseEvent.clientY - start.clientY;
      const nextWidth = Math.max(minWidth, start.width + deltaX);
      const nextHeight = Math.max(minHeight, start.height + deltaY);

      setWidth(nextWidth);
      setHeight(nextHeight);
    },
    [minWidth, minHeight]
  );

  const handleMouseUp = useCallback(() => {
    startRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const handleResizeMouseDown = useCallback(
    (mouseEvent: React.MouseEvent) => {
      mouseEvent.preventDefault();
      startRef.current = {
        clientX: mouseEvent.clientX,
        clientY: mouseEvent.clientY,
        width,
        height,
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    },
    [width, height, handleMouseMove, handleMouseUp]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    width,
    height,
    resizeHandleProps: {
      onMouseDown: handleResizeMouseDown,
    },
  };
};
