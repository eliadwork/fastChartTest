import { useCallback, useContext, useMemo } from 'react';
import { SciChartSurface } from 'scichart';
import { SciChartSurfaceContext } from 'scichart-react';

import {
  LEGEND_DEFAULT_STROKE,
  LEGEND_DEFAULT_STROKE_THICKNESS,
  LEGEND_SERIES_NAME_PREFIX,
} from './legendConstants';

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
  series?: LegendSeriesItemModel[];
  seriesVisibility?: boolean[];
  seriesGroupKeys?: (string | undefined)[];
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
  const initResult = useContext(SciChartSurfaceContext);
  const surface = initResult?.sciChartSurface as SciChartSurface | undefined;

  const seriesList = useMemo<SeriesInfo[]>(() => {
    if (series != null) {
      return series.map((seriesItem) => ({
        name: seriesItem.name,
        stroke: seriesItem.stroke,
        strokeDashArray: seriesItem.strokeDashArray,
        strokeThickness: seriesItem.strokeThickness,
        isVisible: seriesVisibility?.[seriesItem.index] ?? true,
        index: seriesItem.index,
      }));
    }

    if (!surface) {
      return [];
    }

    const renderableSeries = surface.renderableSeries.asArray();
    const nextSeriesList: SeriesInfo[] = [];

    for (let seriesIndex = 0; seriesIndex < renderableSeries.length; seriesIndex += 1) {
      const renderableSeriesItem = renderableSeries[seriesIndex] as {
        stroke: string;
        strokeThickness?: number;
        strokeDashArray?: number[];
        isVisible: boolean;
        dataSeries?: { dataSeriesName?: string };
      };

      const name =
        renderableSeriesItem.dataSeries?.dataSeriesName ??
        `${LEGEND_SERIES_NAME_PREFIX} ${seriesIndex}`;

      nextSeriesList.push({
        name,
        stroke: renderableSeriesItem.stroke ?? LEGEND_DEFAULT_STROKE,
        strokeDashArray: renderableSeriesItem.strokeDashArray,
        strokeThickness:
          renderableSeriesItem.strokeThickness ?? LEGEND_DEFAULT_STROKE_THICKNESS,
        isVisible: seriesVisibility?.[seriesIndex] ?? renderableSeriesItem.isVisible,
        index: seriesIndex,
      });
    }

    return nextSeriesList;
  }, [series, seriesVisibility, surface]);

  const handleClick = useCallback(
    (seriesIndex: number) => {
      const isVisible = seriesVisibility?.[seriesIndex] ?? true;
      onSeriesVisibilityChange?.(seriesIndex, !isVisible);
    },
    [seriesVisibility, onSeriesVisibilityChange]
  );

  const handleGroupClick = useCallback(
    (seriesIndices: number[]) => {
      const anyVisible = seriesIndices.some(
        (seriesIndex) => seriesVisibility?.[seriesIndex] ?? true
      );
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
