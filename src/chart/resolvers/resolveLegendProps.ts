import type { LegendSeriesItemModel } from '../Legend/useLegend';

import {
  LEGEND_DEFAULT_BACKGROUND,
  LEGEND_DEFAULT_STROKE,
  LEGEND_DEFAULT_STROKE_THICKNESS,
  LEGEND_DEFAULT_TEXT_COLOR,
  LEGEND_SERIES_NAME_PREFIX,
} from '../Legend/legendConstants';

const EMPTY_SERIES_ITEMS: LegendSeriesItemModel[] = [];
const EMPTY_SERIES_GROUP_KEYS: (string | undefined)[] = [];

export interface ResolveLegendPropsParams {
  backgroundColor?: string;
  textColor?: string;
  series?: LegendSeriesItemModel[];
  seriesVisibility?: boolean[];
  seriesGroupKeys?: (string | undefined)[];
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void;
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void;
}

export interface ResolvedLegendProps {
  backgroundColor: string;
  textColor: string;
  series: LegendSeriesItemModel[];
  seriesVisibility: boolean[];
  seriesGroupKeys: (string | undefined)[];
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void;
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void;
}

const resolveLegendSeries = (
  series?: LegendSeriesItemModel[]
): LegendSeriesItemModel[] => {
  if (series == null || series.length === 0) {
    return EMPTY_SERIES_ITEMS;
  }

  return series.map((seriesItem) => ({
    index: seriesItem.index,
    name: seriesItem.name ?? `${LEGEND_SERIES_NAME_PREFIX} ${seriesItem.index}`,
    stroke: seriesItem.stroke ?? LEGEND_DEFAULT_STROKE,
    strokeDashArray: seriesItem.strokeDashArray,
    strokeThickness: seriesItem.strokeThickness ?? LEGEND_DEFAULT_STROKE_THICKNESS,
  }));
};

const resolveLegendSeriesVisibility = (
  seriesVisibility: boolean[] | undefined,
  seriesLength: number
): boolean[] => {
  if (seriesLength === 0) {
    return [];
  }

  return Array.from({ length: seriesLength }, (_, seriesIndex) => {
    const currentVisibility = seriesVisibility?.[seriesIndex];
    return currentVisibility !== false;
  });
};

export const resolveLegendProps = ({
  backgroundColor,
  textColor,
  series,
  seriesVisibility,
  seriesGroupKeys,
  onSeriesVisibilityChange,
  onSeriesVisibilityGroupChange,
}: ResolveLegendPropsParams): ResolvedLegendProps => {
  const resolvedSeries = resolveLegendSeries(series);
  const resolvedSeriesVisibility = resolveLegendSeriesVisibility(
    seriesVisibility,
    resolvedSeries.length
  );

  return {
    backgroundColor: backgroundColor ?? LEGEND_DEFAULT_BACKGROUND,
    textColor: textColor ?? LEGEND_DEFAULT_TEXT_COLOR,
    series: resolvedSeries,
    seriesVisibility: resolvedSeriesVisibility,
    seriesGroupKeys:
      seriesGroupKeys == null ? EMPTY_SERIES_GROUP_KEYS : seriesGroupKeys,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  };
};
