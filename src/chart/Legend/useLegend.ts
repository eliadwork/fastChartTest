import { useCallback, useMemo } from 'react';

export interface SeriesInfo {
  name: string;
  stroke: string;
  strokeDashArray?: number[];
  strokeThickness: number;
  isVisible: boolean;
  index: number;
}

export interface LegendGroup {
  name: string;
  seriesIndices: number[];
}

export interface UseLegendOptions {
  series: LegendSeriesItemModel[];
  seriesVisibility: boolean[];
  seriesGroupKeys: (string | undefined)[];
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void;
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void;
}

export interface LegendSeriesItemModel {
  index: number;
  name: string;
  stroke: string;
  strokeDashArray?: number[];
  strokeThickness: number;
}

export const useLegend = ({
  series,
  seriesVisibility,
  seriesGroupKeys,
  onSeriesVisibilityChange,
  onSeriesVisibilityGroupChange,
}: UseLegendOptions) => {
  const seriesList = useMemo<SeriesInfo[]>(() => {
    return series.map((seriesItem) => ({
      name: seriesItem.name,
      stroke: seriesItem.stroke,
      strokeDashArray: seriesItem.strokeDashArray,
      strokeThickness: seriesItem.strokeThickness,
      isVisible: seriesVisibility[seriesItem.index],
      index: seriesItem.index,
    }));
  }, [series, seriesVisibility]);

  const handleClick = useCallback(
    (seriesIndex: number) => {
      const isVisible = seriesVisibility[seriesIndex];
      onSeriesVisibilityChange?.(seriesIndex, !isVisible);
    },
    [seriesVisibility, onSeriesVisibilityChange]
  );

  const handleGroupClick = useCallback(
    (seriesIndices: number[]) => {
      const anyVisible = seriesIndices.some((seriesIndex) => seriesVisibility[seriesIndex]);
      onSeriesVisibilityGroupChange?.(seriesIndices, !anyVisible);
    },
    [seriesVisibility, onSeriesVisibilityGroupChange]
  );

  const groups = useMemo<LegendGroup[]>(() => {
    const groupedSeries: LegendGroup[] = [];
    const groupIndexByName = new Map<string, number>();

    for (let seriesIndex = 0; seriesIndex < seriesList.length; seriesIndex += 1) {
      const groupKey = seriesGroupKeys?.[seriesIndex];
      if (groupKey == null || groupKey === '') {
        continue;
      }

      const existingGroupIndex = groupIndexByName.get(groupKey);
      if (existingGroupIndex === undefined) {
        groupIndexByName.set(groupKey, groupedSeries.length);
        groupedSeries.push({
          name: groupKey,
          seriesIndices: [seriesIndex],
        });
        continue;
      }

      groupedSeries[existingGroupIndex]!.seriesIndices.push(seriesIndex);
    }

    return groupedSeries;
  }, [seriesList, seriesGroupKeys]);

  const ungrouped = useMemo(() => {
    const groupedIndices = new Set<number>();
    for (const group of groups) {
      for (const seriesIndex of group.seriesIndices) {
        groupedIndices.add(seriesIndex);
      }
    }

    return seriesList.filter((series) => !groupedIndices.has(series.index));
  }, [groups, seriesList]);

  return {
    seriesList,
    groups,
    ungrouped,
    handleClick,
    handleGroupClick,
  };
};
