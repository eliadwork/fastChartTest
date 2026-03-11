import type { ChartData, ChartIcon, ChartOptions, ChartShape } from '../../../chart';

import { useMemo } from 'react';

import { resolveDetectChartOptions } from '../resolveDetectChartOptions';
import type { DetectChartModelParams, SeriesBoundIcon, SeriesBoundShape } from './detectPointMarkFlowTypes';

interface UseDetectShapesParams {
  baseShapes: ChartShape[];
  additionalShapes: SeriesBoundShape[];
  shouldFilterByVisibility: boolean;
  seriesVisibility: boolean[];
}

const useDetectShapes = ({
  baseShapes,
  additionalShapes,
  shouldFilterByVisibility,
  seriesVisibility,
}: UseDetectShapesParams): ChartShape[] =>
  useMemo(() => {
    const allShapes: SeriesBoundShape[] = [
      ...(baseShapes as SeriesBoundShape[]),
      ...additionalShapes,
    ];

    return allShapes
      .filter((shape) => {
        if (!shouldFilterByVisibility) {
          return true;
        }

        const shapeSeriesIndex = shape.seriesIndex;
        if (shapeSeriesIndex == null) {
          return true;
        }

        return seriesVisibility[shapeSeriesIndex] !== false;
      })
      .map((shape) => {
        const shapeWithoutSeriesIndex = { ...shape };
        delete shapeWithoutSeriesIndex.seriesIndex;
        return shapeWithoutSeriesIndex as ChartShape;
      });
  }, [additionalShapes, baseShapes, seriesVisibility, shouldFilterByVisibility]);

interface UseDetectIconsParams {
  data: ChartData | null;
  baseIcons: ChartIcon[];
  additionalIcons: SeriesBoundIcon[];
  shouldFilterByVisibility: boolean;
  seriesVisibility: boolean[];
}

const useDetectIcons = ({
  data,
  baseIcons,
  additionalIcons,
  shouldFilterByVisibility,
  seriesVisibility,
}: UseDetectIconsParams): ChartIcon[] =>
  useMemo(() => {
    if (!data) {
      return [];
    }

    const allIcons: SeriesBoundIcon[] = [...(baseIcons as SeriesBoundIcon[]), ...additionalIcons];

    return allIcons
      .filter((icon) => {
        if (!shouldFilterByVisibility) {
          return true;
        }

        const iconSeriesIndex = icon.seriesIndex;
        if (iconSeriesIndex == null) {
          return true;
        }

        return seriesVisibility[iconSeriesIndex] !== false;
      })
      .map((icon) => {
        const iconWithoutSeriesIndex = { ...icon };
        delete iconWithoutSeriesIndex.seriesIndex;
        return iconWithoutSeriesIndex as ChartIcon;
      });
  }, [additionalIcons, baseIcons, data, seriesVisibility, shouldFilterByVisibility]);

export const useDetectChart = ({
  data,
  options,
  baseShapes,
  baseIcons,
  additionalSeriesShapes,
  additionalSeriesIcons,
  seriesVisibility,
  showShapesForHiddenSeries,
  onMiddleClick,
  onSeriesVisibilityStateChange,
}: DetectChartModelParams) => {
  const shouldFilterByVisibility = !showShapesForHiddenSeries;

  const finalShapes = useDetectShapes({
    baseShapes,
    additionalShapes: additionalSeriesShapes,
    shouldFilterByVisibility,
    seriesVisibility,
  });

  const finalIcons = useDetectIcons({
    data,
    baseIcons,
    additionalIcons: additionalSeriesIcons,
    shouldFilterByVisibility,
    seriesVisibility,
  });

  const chartOptions: ChartOptions = useMemo(
    () =>
      resolveDetectChartOptions({
        options,
        hasData: data != null,
        onMiddleClick,
      }),
    [data, onMiddleClick, options]
  );

  return {
    chartOptions,
    finalShapes,
    finalIcons,
    onSeriesVisibilityChange: onSeriesVisibilityStateChange,
  };
};
