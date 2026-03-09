import type {
  ChartData,
  ChartDataSeries,
  ChartIcon,
  ChartOptions,
  ChartShape,
} from '../../../chart/types';

import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_POINT_MARK_ICON_SVG } from '../../../assets/pointMarkIcon';
import { getInterpolatedPointAtX } from '../../../utils/chartDataLookup';
import {
  DETECT_COLOR_HEX_BY_NAME,
  DETECT_HOW_TO_USE_ADDITIONAL,
  DETECT_POINT_MARK_COLORS,
} from '../detectConstants';
import { createPendingLineShape, EMPTY_LINE_SHAPES } from '../detectPointMarkUtils';

type MarkedPointPending = {
  location: { x: number; y?: number };
  color?: (typeof DETECT_POINT_MARK_COLORS)[number];
};

type ChartShapeWithOptionalSeriesIndex = ChartShape & { seriesIndex?: number };
type ChartIconWithOptionalSeriesIndex = ChartIcon & { seriesIndex?: number };

export interface UseDetectPointMarkFlowOptions {
  data: ChartData | null;
}

export interface DetectPointMarkFlowState {
  additionalShapes: ChartShapeWithOptionalSeriesIndex[];
  additionalIcons: ChartIconWithOptionalSeriesIndex[];
  seriesVisibility: boolean[];
  showShapesForHiddenSeries: boolean;
  seriesPickerOpen: boolean;
  markedPoints: MarkedPointPending[] | null;
  chartDataForModal: { lines: ChartDataSeries[] } | null;
  bindableIndices: number[];
  bindableIndicesBase: number[];
  requestedSeriesIndex: number | null;
  setRequestedSeriesIndex: (seriesIndex: number | null) => void;
  setMiddlePointColor: (color: (typeof DETECT_POINT_MARK_COLORS)[number]) => void;
  handleMiddleClick: (
    event: MouseEvent,
    xValue: number,
    yValue: number,
    getSeriesVisibility?: () => boolean[]
  ) => void;
  confirmSeries: (seriesIndex: number) => void;
  onUndoLastClick: () => void;
  onCancelFlow: () => void;
  onSeriesVisibilityStateChange: (visibility: boolean[]) => void;
  toggleShowShapesForHiddenSeries: () => void;
}

const useDetectShapes = ({
  baseShapes,
  additionalShapes,
  shouldFilterByVisibility,
  seriesVisibility,
}: {
  baseShapes: ChartShape[];
  additionalShapes: ChartShapeWithOptionalSeriesIndex[];
  shouldFilterByVisibility: boolean;
  seriesVisibility: boolean[];
}) => {
  return useMemo(() => {
    const allShapes: ChartShapeWithOptionalSeriesIndex[] = [
      ...(baseShapes as ChartShapeWithOptionalSeriesIndex[]),
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
  }, [baseShapes, additionalShapes, shouldFilterByVisibility, seriesVisibility]);
};

const useDetectIcons = ({
  data,
  baseIcons,
  additionalIcons,
  shouldFilterByVisibility,
  seriesVisibility,
}: {
  data: ChartData | null;
  baseIcons: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>;
  additionalIcons: ChartIconWithOptionalSeriesIndex[];
  shouldFilterByVisibility: boolean;
  seriesVisibility: boolean[];
}) => {
  return useMemo(() => {
    if (!data) {
      return [];
    }

    const allIcons: ChartIconWithOptionalSeriesIndex[] = [
      ...(baseIcons as ChartIconWithOptionalSeriesIndex[]),
      ...additionalIcons,
    ];

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
  }, [data, baseIcons, additionalIcons, shouldFilterByVisibility, seriesVisibility]);
};

export interface UseDetectChartOptions {
  data: ChartData | null;
  options: ChartOptions;
  baseShapes: ChartShape[];
  baseIcons: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>;
  additionalBindedShapes: ChartShapeWithOptionalSeriesIndex[];
  additionalBindedIcons: ChartIconWithOptionalSeriesIndex[];
  seriesVisibility: boolean[];
  showShapesForHiddenSeries: boolean;
  onMiddleClick: (
    event: MouseEvent,
    xValue: number,
    yValue: number,
    getSeriesVisibility?: () => boolean[]
  ) => void;
  onSeriesVisibilityStateChange: (visibility: boolean[]) => void;
  toggleShowShapesForHiddenSeries: () => void;
}

export interface UseDetectModalOptions {
  seriesPickerOpen: boolean;
  chartDataForModal: { lines: ChartDataSeries[] } | null;
  bindableIndices: number[];
  bindableIndicesBase: number[];
  requestedSeriesIndex: number | null;
  markedPoints: MarkedPointPending[] | null;
  setSelectedSeriesIndex: (seriesIndex: number | null) => void;
  setMiddlePointColor: (color: (typeof DETECT_POINT_MARK_COLORS)[number]) => void;
  confirmSeries: (seriesIndex: number) => void;
  onUndoLastClick: () => void;
  onCancelFlow: () => void;
}

export const useDetectPointMarkFlow = ({
  data,
}: UseDetectPointMarkFlowOptions): DetectPointMarkFlowState => {
  const { enqueueSnackbar } = useSnackbar();

  const [clicks, setClicks] = useState<{ x: number; y: number }[]>([]);
  const [markedPoints, setMarkedPoints] = useState<MarkedPointPending[] | null>(null);
  const [confirmedShapes, setConfirmedShapes] = useState<ChartShapeWithOptionalSeriesIndex[]>([]);
  const [confirmedIcons, setConfirmedIcons] = useState<ChartIconWithOptionalSeriesIndex[]>([]);
  const [seriesVisibility, setSeriesVisibility] = useState<boolean[]>([]);
  const [showShapesForHiddenSeries, setShowShapesForHiddenSeries] = useState(false);

  const [seriesPickerOpen, setSeriesPickerOpen] = useState(false);
  const [markedXValues, setMarkedXValues] = useState<[number, number, number] | null>(null);
  const [chartDataForModal, setChartDataForModal] = useState<{ lines: ChartDataSeries[] } | null>(
    null
  );
  const [bindableIndices, setBindableIndices] = useState<number[]>([]);
  const [bindableIndicesBase, setBindableIndicesBase] = useState<number[]>([]);
  const [clicksToRestoreOnUndo, setClicksToRestoreOnUndo] = useState<{ x: number; y: number }[]>(
    []
  );
  const [requestedSeriesIndex, setRequestedSeriesIndex] = useState<number | null>(null);

  const shouldFilterByVisibility = !showShapesForHiddenSeries;

  const closeSeriesPicker = useCallback(() => {
    setSeriesPickerOpen(false);
    setMarkedXValues(null);
    setChartDataForModal(null);
    setBindableIndices([]);
    setBindableIndicesBase([]);
    setClicksToRestoreOnUndo([]);
    setRequestedSeriesIndex(null);
  }, []);

  const handleMiddleClick = useCallback(
    (_event: MouseEvent, xValue: number, yValue: number, getSeriesVisibility?: () => boolean[]) => {
      if (!data) {
        return;
      }

      const seriesBindable = data.map((line) => line.style?.bindable !== false);
      const visibility = getSeriesVisibility?.();

      let visibleBindableIndices = Array.from({ length: data.length }, (_, index) => index);
      visibleBindableIndices = visibleBindableIndices.filter(
        (index) => seriesBindable[index] !== false
      );

      if (visibility && visibility.length > 0) {
        visibleBindableIndices = visibleBindableIndices.filter(
          (index) => visibility[index] !== false
        );
      }

      setClicks((previousClicks) => {
        const nextClicks = [...previousClicks, { x: xValue, y: yValue }];

        if (nextClicks.length === 3) {
          const [firstClick, middleClick, thirdClick] = nextClicks;
          const minimumX = Math.min(firstClick.x, thirdClick.x);
          const maximumX = Math.max(firstClick.x, thirdClick.x);

          if (middleClick.x < minimumX || middleClick.x > maximumX) {
            enqueueSnackbar('Pick must be between the two shoulders.', { variant: 'error' });
            return [firstClick, middleClick];
          }

          const bindableIndicesForAllSeries = Array.from(
            { length: data.length },
            (_, index) => index
          ).filter((index) => seriesBindable[index] !== false);

          setMarkedPoints([
            { location: { x: firstClick.x } },
            { location: { x: middleClick.x, y: middleClick.y } },
            { location: { x: thirdClick.x } },
          ]);

          const shouldOpenModal = data.length > 0;
          setMarkedXValues([firstClick.x, middleClick.x, thirdClick.x]);
          setChartDataForModal(shouldOpenModal ? { lines: data } : null);
          setBindableIndices(shouldOpenModal ? visibleBindableIndices : []);
          setBindableIndicesBase(shouldOpenModal ? bindableIndicesForAllSeries : []);
          setClicksToRestoreOnUndo([firstClick, middleClick]);
          setSeriesPickerOpen(shouldOpenModal);

          return [];
        }

        if (data.length > 0) {
          return nextClicks;
        }

        return previousClicks;
      });
    },
    [data, enqueueSnackbar]
  );

  const confirmSeries = useCallback(
    (seriesIndex: number) => {
      if (!markedPoints || !markedXValues || !chartDataForModal) {
        return;
      }

      const [leftX, middleX, rightX] = markedXValues;
      const leftPoint = getInterpolatedPointAtX(chartDataForModal, leftX, seriesIndex);
      const middlePoint = getInterpolatedPointAtX(chartDataForModal, middleX, seriesIndex);
      const rightPoint = getInterpolatedPointAtX(chartDataForModal, rightX, seriesIndex);

      if (!leftPoint || !middlePoint || !rightPoint) {
        return;
      }

      const newShapes: ChartShapeWithOptionalSeriesIndex[] = markedXValues.map((xValue, index) => ({
        ...createPendingLineShape(index, xValue),
        seriesIndex,
      }));
      setConfirmedShapes((previousShapes) => [...previousShapes, ...newShapes]);

      const middleColor = markedPoints[1]?.color;
      const newIcon: ChartIconWithOptionalSeriesIndex = {
        iconImage: DEFAULT_POINT_MARK_ICON_SVG,
        location: middlePoint,
        color: middleColor ? DETECT_COLOR_HEX_BY_NAME[middleColor] : undefined,
        seriesIndex,
      };
      setConfirmedIcons((previousIcons) => [...previousIcons, newIcon]);

      enqueueSnackbar('Saved 3 points', { autoHideDuration: 3000 });
      setMarkedPoints(null);
      closeSeriesPicker();
    },
    [markedPoints, markedXValues, chartDataForModal, closeSeriesPicker, enqueueSnackbar]
  );

  const onUndoLastClick = useCallback(() => {
    if (seriesPickerOpen) {
      setClicks(clicksToRestoreOnUndo);
      setMarkedPoints(null);
      closeSeriesPicker();
      return;
    }

    if (clicks.length > 0) {
      setClicks((previousClicks) => previousClicks.slice(0, -1));
    }
  }, [seriesPickerOpen, clicksToRestoreOnUndo, closeSeriesPicker, clicks.length]);

  const onCancelFlow = useCallback(() => {
    setClicks([]);
    setMarkedPoints(null);
    closeSeriesPicker();
  }, [closeSeriesPicker]);

  const setMiddlePointColor = useCallback((color: (typeof DETECT_POINT_MARK_COLORS)[number]) => {
    setMarkedPoints((previousPoints) => {
      if (!previousPoints || previousPoints.length < 2) {
        return previousPoints;
      }

      const nextPoints = [...previousPoints];
      nextPoints[1] = {
        ...nextPoints[1]!,
        color,
      };

      return nextPoints;
    });
  }, []);

  const pendingAdditionalShapes = useMemo<ChartShapeWithOptionalSeriesIndex[]>(() => {
    if (clicks.length > 0) {
      return clicks.map((click, clickIndex) => createPendingLineShape(clickIndex, click.x));
    }

    if (seriesPickerOpen && markedXValues) {
      return markedXValues.map((xValue, clickIndex) => createPendingLineShape(clickIndex, xValue));
    }

    return EMPTY_LINE_SHAPES;
  }, [clicks, seriesPickerOpen, markedXValues]);

  const additionalShapes = useMemo(
    () => [...confirmedShapes, ...pendingAdditionalShapes],
    [confirmedShapes, pendingAdditionalShapes]
  );

  const additionalIcons = confirmedIcons;

  const onSeriesVisibilityStateChange = useCallback(
    (visibility: boolean[]) => {
      setSeriesVisibility(visibility);

      if (!shouldFilterByVisibility || !seriesPickerOpen) {
        return;
      }

      const visibleBindableIndices = bindableIndicesBase.filter(
        (index) => visibility[index] !== false
      );

      setBindableIndices(visibleBindableIndices);
    },
    [shouldFilterByVisibility, seriesPickerOpen, bindableIndicesBase]
  );

  const toggleShowShapesForHiddenSeries = useCallback(() => {
    setShowShapesForHiddenSeries((isVisible) => !isVisible);
  }, []);

  return {
    additionalShapes,
    additionalIcons,
    seriesVisibility,
    showShapesForHiddenSeries,
    seriesPickerOpen,
    markedPoints,
    chartDataForModal,
    bindableIndices,
    bindableIndicesBase,
    requestedSeriesIndex,
    setRequestedSeriesIndex,
    setMiddlePointColor,
    handleMiddleClick,
    confirmSeries,
    onUndoLastClick,
    onCancelFlow,
    onSeriesVisibilityStateChange,
    toggleShowShapesForHiddenSeries,
  };
};

export const useDetectChart = ({
  data,
  options,
  baseShapes,
  baseIcons,
  additionalBindedShapes: additionalShapes,
  additionalBindedIcons: additionalIcons,
  seriesVisibility,
  showShapesForHiddenSeries,
  onMiddleClick,
  onSeriesVisibilityStateChange,
  toggleShowShapesForHiddenSeries,
}: UseDetectChartOptions) => {
  const shouldFilterByVisibility = !showShapesForHiddenSeries;

  const finalShapes = useDetectShapes({
    baseShapes,
    additionalShapes,
    shouldFilterByVisibility,
    seriesVisibility,
  });

  const finalIcons = useDetectIcons({
    data,
    baseIcons,
    additionalIcons,
    shouldFilterByVisibility,
    seriesVisibility,
  });

  const chartOptions = useMemo(
    () => ({
      ...options,
      howToUseAdditional: options.howToUseAdditional ?? DETECT_HOW_TO_USE_ADDITIONAL,
      events: data
        ? {
            ...options.events,
            onmiddleclick: (
              event: MouseEvent,
              xValue: number,
              yValue: number,
              getSeriesVisibility?: () => boolean[]
            ) => {
              onMiddleClick(
                event,
                xValue,
                yValue,
                getSeriesVisibility
              );
            },
          }
        : options.events,
    }),
    [options, data, onMiddleClick]
  );

  const onSeriesVisibilityChange = useCallback(
    (visibility: boolean[]) => {
      onSeriesVisibilityStateChange(visibility);
    },
    [onSeriesVisibilityStateChange]
  );

  return {
    chartOptions,
    finalShapes,
    finalIcons,
    onSeriesVisibilityChange,
    showShapesForHiddenSeries,
    toggleShowShapesForHiddenSeries,
  };
};

export const useDetectModal = ({
  seriesPickerOpen,
  chartDataForModal,
  bindableIndices,
  bindableIndicesBase,
  requestedSeriesIndex,
  markedPoints,
  setSelectedSeriesIndex,
  setMiddlePointColor,
  confirmSeries,
  onUndoLastClick,
  onCancelFlow,
}: UseDetectModalOptions) => {
  const seriesOptions = useMemo(
    () =>
      bindableIndicesBase.length > 0
        ? bindableIndicesBase
        : Array.from({ length: chartDataForModal?.lines.length ?? 0 }, (_, index) => index),
    [bindableIndicesBase, chartDataForModal?.lines.length]
  );

  const seriesNames = useMemo(
    () => chartDataForModal?.lines.map((line) => line.name) ?? [],
    [chartDataForModal]
  );

  const selectedSeriesIndex = useMemo(() => {
    if (!seriesPickerOpen || seriesOptions.length === 0) {
      return -1;
    }

    if (requestedSeriesIndex != null && seriesOptions.includes(requestedSeriesIndex)) {
      return requestedSeriesIndex;
    }

    if (bindableIndices.length === 0) {
      return -1;
    }

    const firstVisibleBindable = bindableIndices[0];
    if (firstVisibleBindable != null && seriesOptions.includes(firstVisibleBindable)) {
      return firstVisibleBindable;
    }

    return -1;
  }, [seriesPickerOpen, requestedSeriesIndex, bindableIndices, seriesOptions]);

  const canConfirm = selectedSeriesIndex >= 0 && markedPoints?.[1]?.color != null;

  const onDone = useCallback(() => {
    if (!canConfirm) {
      return;
    }

    confirmSeries(selectedSeriesIndex);
  }, [canConfirm, confirmSeries, selectedSeriesIndex]);

  useEffect(() => {
    if (!seriesPickerOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      onDone();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [seriesPickerOpen, onDone]);

  return {
    open: seriesPickerOpen && !!chartDataForModal,
    colorOptions: DETECT_POINT_MARK_COLORS,
    selectedColor: markedPoints?.[1]?.color,
    seriesOptions,
    seriesNames,
    selectedSeriesIndex,
    canConfirm,
    setSelectedSeriesIndex,
    setMiddlePointColor,
    onDone,
    onUndoLastClick,
    onCancelFlow,
  };
};
