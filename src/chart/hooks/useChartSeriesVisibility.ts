import { useCallback, useMemo, useState } from 'react';

export interface UseChartSeriesVisibilityOptions {
  initialSeriesCount: number;
  initialVisibility?: boolean[];
}

const buildDefaultVisibility = (seriesCount: number): boolean[] =>
  Array.from({ length: seriesCount }, () => true);

const normalizeSeriesVisibility = (
  seriesVisibility: boolean[],
  seriesCount: number
): boolean[] => {
  if (seriesVisibility.length === seriesCount) {
    return seriesVisibility;
  }

  if (seriesVisibility.length < seriesCount) {
    return [
      ...seriesVisibility,
      ...Array.from({ length: seriesCount - seriesVisibility.length }, () => true),
    ];
  }

  return seriesVisibility.slice(0, seriesCount);
};

export const useChartSeriesVisibility = ({
  initialSeriesCount,
  initialVisibility,
}: UseChartSeriesVisibilityOptions) => {
  const [seriesVisibilityState, setSeriesVisibilityState] = useState<boolean[]>(() =>
    normalizeSeriesVisibility(
      initialVisibility ?? buildDefaultVisibility(initialSeriesCount),
      initialSeriesCount
    )
  );

  const seriesVisibility = useMemo(
    () => normalizeSeriesVisibility(seriesVisibilityState, initialSeriesCount),
    [seriesVisibilityState, initialSeriesCount]
  );

  const handleDisableAll = useCallback(() => {
    setSeriesVisibilityState((previousVisibility) => {
      const normalizedVisibility = normalizeSeriesVisibility(
        previousVisibility,
        initialSeriesCount
      );
      const everySeriesHidden = normalizedVisibility.every((isVisible) => !isVisible);
      return normalizedVisibility.map(() => everySeriesHidden);
    });
  }, [initialSeriesCount]);

  const handleSeriesVisibilityChange = useCallback(
    (seriesIndex: number, isVisible: boolean) => {
      setSeriesVisibilityState((previousVisibility) => {
        const normalizedVisibility = normalizeSeriesVisibility(
          previousVisibility,
          initialSeriesCount
        );
        if (seriesIndex < 0 || seriesIndex >= normalizedVisibility.length) {
          return normalizedVisibility;
        }

        const nextVisibility = [...normalizedVisibility];
        nextVisibility[seriesIndex] = isVisible;
        return nextVisibility;
      });
    },
    [initialSeriesCount]
  );

  const handleSeriesVisibilityGroupChange = useCallback(
    (seriesIndices: number[], isVisible: boolean) => {
      setSeriesVisibilityState((previousVisibility) => {
        const normalizedVisibility = normalizeSeriesVisibility(
          previousVisibility,
          initialSeriesCount
        );
        const nextVisibility = [...normalizedVisibility];

        for (const seriesIndex of seriesIndices) {
          if (seriesIndex >= 0 && seriesIndex < nextVisibility.length) {
            nextVisibility[seriesIndex] = isVisible;
          }
        }

        return nextVisibility;
      });
    },
    [initialSeriesCount]
  );

  const allSeriesHidden =
    seriesVisibility.length > 0 && seriesVisibility.every((isVisible) => !isVisible);

  return {
    seriesVisibility,
    handleDisableAll,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    allSeriesHidden,
  };
};
