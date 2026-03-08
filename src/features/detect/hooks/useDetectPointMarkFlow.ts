import type {
  ChartData,
  ChartMiddleClickEvent,
  ChartOptions,
  ChartShape,
} from '../../../chart/types';

import { useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';

import { usePointMarkStore } from '../../../store/pointMarkStore';
import {
  EMPTY_LINE_SHAPES,
  createPendingLineShape,
} from '../detectPointMarkUtils';

export interface UseDetectPointMarkFlowOptions {
  chartId: string;
  data: ChartData | null;
  options: ChartOptions;
  shapes?: ChartShape[];
  icons: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>;
}

export const useDetectPointMarkFlow = ({
  chartId,
  data,
  options,
  shapes: baseShapes = [],
  icons,
}: UseDetectPointMarkFlowOptions) => {
  const { enqueueSnackbar } = useSnackbar();

  const chartIdForModal = usePointMarkStore((state) => state.chartIdForModal);
  const markedXValues = usePointMarkStore((state) => state.markedXValues);
  const clicksByChart = usePointMarkStore((state) => state.clicksByChart);
  const addPointMark = usePointMarkStore((state) => state.addPointMark);
  const iconsByChart = usePointMarkStore((state) => state.iconsByChart);
  const shapesByChart = usePointMarkStore((state) => state.shapesByChart);

  const chartIcons = useMemo(
    () => (data ? [...icons, ...(iconsByChart[chartId] ?? [])] : []),
    [data, icons, iconsByChart, chartId]
  );

  const pendingShapes = useMemo(() => {
    const clicks = clicksByChart[chartId];
    if (clicks && clicks.length > 0) {
      return clicks.map((click, clickIndex) =>
        createPendingLineShape(clickIndex, click.x)
      );
    }

    if (chartIdForModal === chartId && markedXValues) {
      return markedXValues.map((xValue, clickIndex) =>
        createPendingLineShape(clickIndex, xValue)
      );
    }

    return EMPTY_LINE_SHAPES;
  }, [clicksByChart, chartId, chartIdForModal, markedXValues]);

  const confirmedShapes = shapesByChart[chartId] ?? EMPTY_LINE_SHAPES;

  const handleMiddleClick = useCallback(
    (event: MouseEvent) => {
      if (!data) {
        return;
      }

      const chartEvent = event as ChartMiddleClickEvent;
      const seriesBindable = data.map((line) => line.style?.bindable !== false);
      const chartDataForStore = { lines: data };

      addPointMark(chartId, chartEvent.xValue, chartEvent.yValue, chartDataForStore, {
        seriesBindable,
        seriesVisibility: chartEvent.getSeriesVisibility?.(),
        onValidationError: (message) => enqueueSnackbar(message, { variant: 'error' }),
      });
    },
    [data, chartId, addPointMark, enqueueSnackbar]
  );

  const chartShapes = useMemo(
    () => [...baseShapes, ...confirmedShapes, ...pendingShapes],
    [baseShapes, confirmedShapes, pendingShapes]
  );

  const chartOptions = useMemo(
    () => ({
      ...options,
      events: data
        ? {
            ...options.events,
            onmiddleclick: handleMiddleClick,
          }
        : options.events,
    }),
    [options, data, handleMiddleClick]
  );

  return {
    chartOptions,
    chartShapes,
    chartIcons,
  };
};
