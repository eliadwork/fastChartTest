import { useCallback, useEffect, useState } from 'react';

export interface UseChartSeriesVisibilityOptions {
  initialSeriesCount: number;
  initialVisibility?: boolean[];
}

export const useChartSeriesVisibility = ({
  initialSeriesCount,
  initialVisibility,
}: UseChartSeriesVisibilityOptions) => {
  const [seriesVisibility, setSeriesVisibility] = useState<boolean[]>(
    () => initialVisibility ?? Array.from({ length: initialSeriesCount }, () => true)
  );

  useEffect(() => {
    setSeriesVisibility((prev) => {
      if (prev.length === initialSeriesCount) return prev;
      if (prev.length < initialSeriesCount)
        return [...prev, ...Array.from({ length: initialSeriesCount - prev.length }, () => true)];
      return prev.slice(0, initialSeriesCount);
    });
  }, [initialSeriesCount]);

  const handleDisableAll = useCallback(() => {
    setSeriesVisibility((prev) =>
      prev.every((visible) => !visible) ? prev.map(() => true) : prev.map(() => false)
    );
  }, []);

  const handleSeriesVisibilityChange = useCallback((index: number, visible: boolean) => {
    setSeriesVisibility((prev) => {
      const next = [...prev];
      if (index >= 0 && index < next.length) next[index] = visible;
      return next;
    });
  }, []);

  const handleSeriesVisibilityGroupChange = useCallback((indices: number[], visible: boolean) => {
    setSeriesVisibility((prev) => {
      const next = [...prev];
      for (const index of indices) {
        if (index >= 0 && index < next.length) next[index] = visible;
      }
      return next;
    });
  }, []);

  const allSeriesHidden =
    seriesVisibility.length > 0 && seriesVisibility.every((visible) => !visible);

  return {
    seriesVisibility,
    handleDisableAll,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    allSeriesHidden,
  };
};
