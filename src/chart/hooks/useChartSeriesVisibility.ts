import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseChartSeriesVisibilityOptions {
  /** Current number of series rendered by the chart. */
  initialSeriesCount: number;
  /** Optional externally-controlled visibility array (index-aligned to series). */
  initialVisibility?: boolean[];
}

/** Default visibility when nothing is provided: every series is visible. */
const buildDefaultVisibility = (seriesCount: number): boolean[] =>
  Array.from({ length: seriesCount }, () => true);

/**
 * Keeps visibility array aligned with the current series count.
 * - Too short: pad missing entries with `true` (visible).
 * - Too long: trim extra entries.
 */
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

/**
 * Compares two visibility arrays by value.
 * `left` = current/previous state snapshot.
 * `right` = new candidate visibility (usually from props).
 */
const sameSeriesVisibility = (left: boolean[], right: boolean[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  // Index-by-index equality check; arrays must match exactly.
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
};

export const useChartSeriesVisibility = ({
  initialSeriesCount,
  initialVisibility,
}: UseChartSeriesVisibilityOptions) => {
  // Internal visibility state is always normalized against current series count.
  const [seriesVisibilityState, setSeriesVisibilityState] = useState<boolean[]>(() =>
    normalizeSeriesVisibility(
      initialVisibility ?? buildDefaultVisibility(initialSeriesCount),
      initialSeriesCount
    )
  );

  useEffect(() => {
    // If parent does not control visibility, keep local state as-is.
    if (initialVisibility == null) {
      return;
    }

    // Normalize incoming visibility to avoid length mismatch with current data.
    const normalizedInitialVisibility = normalizeSeriesVisibility(
      initialVisibility,
      initialSeriesCount
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeriesVisibilityState((previousVisibility) => {
      // `previousVisibility` is the latest committed state (safe against stale closures).
      const normalizedPreviousVisibility = normalizeSeriesVisibility(
        previousVisibility,
        initialSeriesCount
      );
      // Update only when values actually changed to avoid unnecessary renders.
      return sameSeriesVisibility(normalizedPreviousVisibility, normalizedInitialVisibility)
        ? previousVisibility
        : normalizedInitialVisibility;
    });
  }, [initialVisibility, initialSeriesCount]);

  // Expose normalized visibility so downstream code always gets array length === series count.
  const seriesVisibility = useMemo(
    () => normalizeSeriesVisibility(seriesVisibilityState, initialSeriesCount),
    [seriesVisibilityState, initialSeriesCount]
  );

  // Toggle behavior:
  // - if all currently hidden -> show all
  // - otherwise -> hide all
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

  // Change a single series visibility by index.
  const handleSeriesVisibilityChange = useCallback(
    (seriesIndex: number, isVisible: boolean) => {
      setSeriesVisibilityState((previousVisibility) => {
        const normalizedVisibility = normalizeSeriesVisibility(
          previousVisibility,
          initialSeriesCount
        );
        // Ignore invalid indices instead of throwing.
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

  // Change visibility for a group of series indices.
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

  // Used by toolbar to decide whether "enable all / disable all" icon should flip state.
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
