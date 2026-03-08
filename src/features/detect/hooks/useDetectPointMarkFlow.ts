import type {
  ChartData,
  ChartDataSeries,
  ChartLineShape,
  ChartMiddleClickEvent,
  ChartOptions,
  ChartShape,
} from '../../../chart/types';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';

import { DEFAULT_POINT_MARK_ICON_SVG } from '../../../assets/pointMarkIcon';
import { getInterpolatedPointAtX } from '../../../utils/chartDataLookup';
import {
  DETECT_COLOR_HEX_BY_NAME,
  DETECT_HOW_TO_USE_ADDITIONAL,
  DETECT_POINT_MARK_COLORS,
} from '../detectConstants';
import {
  createPendingLineShape,
  EMPTY_LINE_SHAPES,
} from '../detectPointMarkUtils';

type MarkedPointPending = {
  location: { x: number; y?: number };
  color?: (typeof DETECT_POINT_MARK_COLORS)[number];
};

export interface UseDetectPointMarkFlowOptions {
  chartId: string;
  data: ChartData | null;
  options: ChartOptions;
  shapes?: ChartShape[];
  icons: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>;
}

export const useDetectPointMarkFlow = ({
  data,
  options,
  shapes: baseShapes = [],
  icons,
}: UseDetectPointMarkFlowOptions) => {
  const { enqueueSnackbar } = useSnackbar();

  const [clicks, setClicks] = useState<{ x: number; y: number }[]>([]);
  const clicksRef = useRef(clicks);
  clicksRef.current = clicks;

  const [confirmedShapes, setConfirmedShapes] = useState<ChartLineShape[]>([]);
  const [confirmedIcons, setConfirmedIcons] = useState<
    Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>
  >([]);
  const [seriesPickerOpen, setSeriesPickerOpen] = useState(false);
  const [markedXValues, setMarkedXValues] = useState<
    [number, number, number] | null
  >(null);
  const [markedPoints, setMarkedPoints] = useState<MarkedPointPending[] | null>(
    null
  );
  const [chartDataForModal, setChartDataForModal] = useState<{
    lines: ChartDataSeries[];
  } | null>(null);
  const [bindableIndices, setBindableIndices] = useState<number[]>([]);
  const [bindableIndicesBase, setBindableIndicesBase] = useState<number[]>([]);
  const [clicksToRestoreOnUndo, setClicksToRestoreOnUndo] = useState<
    { x: number; y: number }[]
  >([]);
  const [requestedSeriesIndex, setRequestedSeriesIndex] = useState<
    number | null
  >(null);

  const chartIcons = useMemo(
    () => (data ? [...icons, ...confirmedIcons] : []),
    [data, icons, confirmedIcons]
  );

  const pendingShapes = useMemo(() => {
    if (clicks.length > 0) {
      return clicks.map((click, clickIndex) =>
        createPendingLineShape(clickIndex, click.x)
      );
    }
    if (seriesPickerOpen && markedXValues) {
      return markedXValues.map((xValue, clickIndex) =>
        createPendingLineShape(clickIndex, xValue)
      );
    }
    return EMPTY_LINE_SHAPES;
  }, [clicks, seriesPickerOpen, markedXValues]);

  const chartShapes = useMemo(
    () => [...baseShapes, ...confirmedShapes, ...pendingShapes],
    [baseShapes, confirmedShapes, pendingShapes]
  );

  const handleMiddleClick = useCallback(
    (event: MouseEvent) => {
      if (!data) return;

      const chartEvent = event as ChartMiddleClickEvent;
      const seriesBindable = data.map((line) => line.style?.bindable !== false);
      const seriesVisibility = chartEvent.getSeriesVisibility?.();

      let bindableIndicesComputed = Array.from(
        { length: data.length },
        (_, index) => index
      );
      if (seriesBindable) {
        bindableIndicesComputed = bindableIndicesComputed.filter(
          (index) => seriesBindable[index] !== false
        );
      }
      if (seriesVisibility && seriesVisibility.length > 0) {
        bindableIndicesComputed = bindableIndicesComputed.filter(
          (index) => seriesVisibility[index] !== false
        );
      }

      const currentClicks = clicksRef.current;
      const nextClicks = [
        ...currentClicks,
        { x: chartEvent.xValue, y: chartEvent.yValue },
      ];

      if (nextClicks.length === 3) {
        const [first, second, third] = nextClicks;
        const minX = Math.min(first.x, third.x);
        const maxX = Math.max(first.x, third.x);
        if (second.x < minX || second.x > maxX) {
          enqueueSnackbar('Pick must be between the two shoulders.', {
            variant: 'error',
          });
          setClicks([first, second]);
          return;
        }

        const bindableIndicesBaseComputed = seriesBindable
          ? Array.from({ length: data.length }, (_, index) => index).filter(
              (index) => seriesBindable[index] !== false
            )
          : Array.from({ length: data.length }, (_, index) => index);

        const openModal = bindableIndicesComputed.length > 0;

        setClicks([]);
        setClicksToRestoreOnUndo([first, second]);
        setMarkedXValues([first.x, second.x, third.x]);
        setMarkedPoints([
          { location: { x: first.x } },
          { location: { x: second.x, y: second.y } },
          { location: { x: third.x } },
        ]);
        setChartDataForModal(openModal ? { lines: data } : null);
        setBindableIndices(openModal ? bindableIndicesComputed : []);
        setBindableIndicesBase(openModal ? bindableIndicesBaseComputed : []);
        setSeriesPickerOpen(openModal);
      } else if (bindableIndicesComputed.length > 0) {
        setClicks(nextClicks);
      }
    },
    [data, enqueueSnackbar]
  );

  const chartOptions = useMemo(
    () => ({
      ...options,
      howToUseAdditional:
        options.howToUseAdditional ?? DETECT_HOW_TO_USE_ADDITIONAL,
      events: data
        ? {
            ...options.events,
            onmiddleclick: handleMiddleClick,
          }
        : options.events,
    }),
    [options, data, handleMiddleClick]
  );

  const modalLines = useMemo(
    () => chartDataForModal?.lines ?? [],
    [chartDataForModal]
  );

  const seriesOptions = useMemo(
    () =>
      bindableIndicesBase.length > 0
        ? bindableIndicesBase
        : Array.from({ length: modalLines.length }, (_, index) => index),
    [bindableIndicesBase, modalLines.length]
  );

  const seriesNames = useMemo(
    () => modalLines.map((line) => line.name),
    [modalLines]
  );

  const selectedSeriesIndex = useMemo(() => {
    if (!seriesPickerOpen || seriesOptions.length === 0) return -1;
    if (
      requestedSeriesIndex != null &&
      seriesOptions.includes(requestedSeriesIndex)
    ) {
      return requestedSeriesIndex;
    }
    const firstVisible = bindableIndices[0];
    const preferVisible =
      firstVisible != null && seriesOptions.includes(firstVisible);
    return preferVisible ? firstVisible : seriesOptions[0] ?? -1;
  }, [seriesPickerOpen, seriesOptions, requestedSeriesIndex, bindableIndices]);

  const canConfirm =
    selectedSeriesIndex >= 0 && markedPoints?.[1]?.color != null;

  const closeSeriesPicker = useCallback(() => {
    setSeriesPickerOpen(false);
    setMarkedXValues(null);
    setMarkedPoints(null);
    setChartDataForModal(null);
    setBindableIndices([]);
    setBindableIndicesBase([]);
    setClicksToRestoreOnUndo([]);
    setRequestedSeriesIndex(null);
  }, []);

  const handleConfirmSeries = useCallback(
    (seriesIndex: number) => {
      if (
        !markedPoints ||
        !markedXValues ||
        !chartDataForModal
      ) {
        return;
      }

      const [leftX, middleX, rightX] = markedXValues;
      const leftPoint = getInterpolatedPointAtX(
        chartDataForModal,
        leftX,
        seriesIndex
      );
      const middlePoint = getInterpolatedPointAtX(
        chartDataForModal,
        middleX,
        seriesIndex
      );
      const rightPoint = getInterpolatedPointAtX(
        chartDataForModal,
        rightX,
        seriesIndex
      );

      if (!leftPoint || !middlePoint || !rightPoint) return;

      const newShapes = markedXValues.map((xValue, index) =>
        createPendingLineShape(index, xValue)
      );
      setConfirmedShapes((prev) => [...prev, ...newShapes]);

      const middleColor = markedPoints[1]?.color;
      setConfirmedIcons((prev) => [
        ...prev,
        {
          iconImage: DEFAULT_POINT_MARK_ICON_SVG,
          location: middlePoint,
          color: middleColor ? DETECT_COLOR_HEX_BY_NAME[middleColor] : undefined,
        },
      ]);

      enqueueSnackbar('Saved 3 points', { autoHideDuration: 3000 });
      setRequestedSeriesIndex(null);
      closeSeriesPicker();
    },
    [
      markedPoints,
      markedXValues,
      chartDataForModal,
      enqueueSnackbar,
      closeSeriesPicker,
    ]
  );

  const handleDone = useCallback(() => {
    if (!canConfirm) return;
    handleConfirmSeries(selectedSeriesIndex);
  }, [canConfirm, handleConfirmSeries, selectedSeriesIndex]);

  const handleUndoLastClick = useCallback(() => {
    if (seriesPickerOpen) {
      setClicks(clicksToRestoreOnUndo);
      setClicksToRestoreOnUndo([]);
      closeSeriesPicker();
    } else if (clicks.length > 0) {
      setClicks((prev) => prev.slice(0, -1));
    }
    setRequestedSeriesIndex(null);
  }, [seriesPickerOpen, clicksToRestoreOnUndo, clicks.length, closeSeriesPicker]);

  const handleCancelFlow = useCallback(() => {
    setClicks([]);
    setClicksToRestoreOnUndo([]);
    closeSeriesPicker();
  }, [closeSeriesPicker]);

  const updateMarkedPointColor = useCallback(
    (index: number, color: (typeof DETECT_POINT_MARK_COLORS)[number] | undefined) => {
      setMarkedPoints((prev) => {
        if (!prev || index < 0 || index >= prev.length) return prev;
        const next = [...prev];
        const point = next[index]!;
        if (color === undefined) {
          const { color: _, ...rest } = point;
          next[index] = rest as MarkedPointPending;
        } else {
          next[index] = { ...point, color };
        }
        return next;
      });
    },
    []
  );

  const setBindableIndicesFromVisibility = useCallback(
    (visibility: boolean[]) => {
      if (!seriesPickerOpen || bindableIndicesBase.length === 0) return;
      const next = bindableIndicesBase.filter(
        (index) => visibility[index] !== false
      );
      setBindableIndices(next);
    },
    [seriesPickerOpen, bindableIndicesBase]
  );

  useEffect(() => {
    if (!seriesPickerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      handleDone();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [seriesPickerOpen, handleDone]);

  return {
    chartOptions,
    chartShapes,
    chartIcons,
    colorOptions: DETECT_POINT_MARK_COLORS,
    selectedColor: markedPoints?.[1]?.color,
    seriesPickerState: {
      open: seriesPickerOpen && !!chartDataForModal,
      seriesOptions,
      seriesNames,
      selectedSeriesIndex,
    },
    canConfirm,
    setSelectedSeriesIndex: setRequestedSeriesIndex,
    setMiddlePointColor: (color: (typeof DETECT_POINT_MARK_COLORS)[number]) =>
      updateMarkedPointColor(1, color),
    onDone: handleDone,
    onUndoLastClick: handleUndoLastClick,
    onCancelFlow: handleCancelFlow,
    onSeriesVisibilityChange: setBindableIndicesFromVisibility,
  };
};
