import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';

import { getInterpolatedPointAtX } from '../../../utils/chartDataLookup';
import {
  DETECT_POINT_MARK_CLICK_RESTORE_COUNT,
  DETECT_POINT_MARK_CLICK_TARGET_COUNT,
  DETECT_POINT_MARK_ERROR_NOT_BETWEEN_SHOULDERS,
  DETECT_POINT_MARK_LEFT_INDEX,
  DETECT_POINT_MARK_MIDDLE_INDEX,
  DETECT_POINT_MARK_RIGHT_INDEX,
  DETECT_POINT_MARK_SAVED_AUTO_HIDE_DURATION,
  DETECT_POINT_MARK_SAVED_MESSAGE,
  EMPTY_LINE_SHAPES,
} from '../detectPointMarkConstants';
import { createPendingLineShape } from '../detectPointMarkUtils';
import type {
  DetectChartDataForModal,
  DetectMiddleClickEvent,
  DetectPointCoordinates,
  DetectPointMarkFlowModel,
  DetectPointMarkFlowParams,
  PendingMarkedPoint,
  SeriesBoundIcon,
  SeriesBoundShape,
} from './detectPointMarkFlowTypes';

const getBindableIndices = (
  seriesCount: number,
  seriesBindable: boolean[],
  visibility?: boolean[]
): number[] =>
  Array.from({ length: seriesCount }, (_, index) => index).filter(
    (index) =>
      seriesBindable[index] !== false &&
      (visibility == null || visibility.length === 0 || visibility[index] !== false)
  );

export const useDetectPointMarkFlow = ({
  data,
  visualConfig,
}: DetectPointMarkFlowParams): DetectPointMarkFlowModel => {
  const { enqueueSnackbar } = useSnackbar();

  const [clicks, setClicks] = useState<DetectPointCoordinates[]>([]);
  const [markedPoints, setMarkedPoints] = useState<PendingMarkedPoint[] | null>(null);
  const [confirmedShapes, setConfirmedShapes] = useState<SeriesBoundShape[]>([]);
  const [confirmedIcons, setConfirmedIcons] = useState<SeriesBoundIcon[]>([]);
  const [seriesVisibility, setSeriesVisibility] = useState<boolean[]>([]);
  const [showShapesForHiddenSeries, setShowShapesForHiddenSeries] = useState(false);

  const [seriesPickerOpen, setSeriesPickerOpen] = useState(false);
  const [markedXValues, setMarkedXValues] = useState<[number, number, number] | null>(null);
  const [chartDataForModal, setChartDataForModal] = useState<DetectChartDataForModal | null>(
    null
  );
  const [bindableIndices, setBindableIndices] = useState<number[]>([]);
  const [bindableIndicesBase, setBindableIndicesBase] = useState<number[]>([]);
  const [clicksToRestoreOnUndo, setClicksToRestoreOnUndo] = useState<DetectPointCoordinates[]>(
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
    (event: MouseEvent) => {
      if (!data) {
        return;
      }

      const middleClickEvent = event as DetectMiddleClickEvent;
      const xValue = middleClickEvent.chartXValue;
      const yValue = middleClickEvent.chartYValue;
      if (xValue == null || yValue == null) {
        return;
      }

      const seriesBindable = data.map((line) => line.style?.bindable !== false);
      const visibility = middleClickEvent.getSeriesVisibility?.();
      const visibleBindableIndices = getBindableIndices(data.length, seriesBindable, visibility);

      setClicks((previousClicks) => {
        const nextClicks = [...previousClicks, { x: xValue, y: yValue }];

        if (nextClicks.length === DETECT_POINT_MARK_CLICK_TARGET_COUNT) {
          const firstClick = nextClicks[DETECT_POINT_MARK_LEFT_INDEX];
          const middleClickPoint = nextClicks[DETECT_POINT_MARK_MIDDLE_INDEX];
          const thirdClick = nextClicks[DETECT_POINT_MARK_RIGHT_INDEX];
          if (!firstClick || !middleClickPoint || !thirdClick) {
            return previousClicks;
          }

          const minimumX = Math.min(firstClick.x, thirdClick.x);
          const maximumX = Math.max(firstClick.x, thirdClick.x);

          if (middleClickPoint.x < minimumX || middleClickPoint.x > maximumX) {
            enqueueSnackbar(DETECT_POINT_MARK_ERROR_NOT_BETWEEN_SHOULDERS, {
              variant: 'error',
            });
            return [firstClick, middleClickPoint];
          }

          const bindableIndicesForAllSeries = getBindableIndices(data.length, seriesBindable);
          const shouldOpenModal = data.length > 0;

          setMarkedPoints([
            { location: { x: firstClick.x } },
            { location: { x: middleClickPoint.x, y: middleClickPoint.y } },
            { location: { x: thirdClick.x } },
          ]);
          setMarkedXValues([firstClick.x, middleClickPoint.x, thirdClick.x]);
          setChartDataForModal(shouldOpenModal ? { lines: data } : null);
          setBindableIndices(shouldOpenModal ? visibleBindableIndices : []);
          setBindableIndicesBase(shouldOpenModal ? bindableIndicesForAllSeries : []);
          setClicksToRestoreOnUndo(
            nextClicks.slice(0, DETECT_POINT_MARK_CLICK_RESTORE_COUNT)
          );
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

      const newShapes: SeriesBoundShape[] = markedXValues.map((xValue, index) => ({
        ...createPendingLineShape(index, xValue, visualConfig.pendingLineColor),
        seriesIndex,
      }));
      setConfirmedShapes((previousShapes) => [...previousShapes, ...newShapes]);

      const middleColor = markedPoints[DETECT_POINT_MARK_MIDDLE_INDEX]?.color;
      const selectedIcon =
        visualConfig.icons.find(
          (iconOption) => iconOption.textRepresentation === middleColor
        )?.icon ?? visualConfig.icons[DETECT_POINT_MARK_LEFT_INDEX]?.icon;

      if (selectedIcon != null) {
        const newIcon: SeriesBoundIcon = {
          iconImage: selectedIcon,
          location: middlePoint,
          seriesIndex,
        };
        setConfirmedIcons((previousIcons) => [...previousIcons, newIcon]);
      }

      enqueueSnackbar(DETECT_POINT_MARK_SAVED_MESSAGE, {
        autoHideDuration: DETECT_POINT_MARK_SAVED_AUTO_HIDE_DURATION,
      });
      setMarkedPoints(null);
      closeSeriesPicker();
    },
    [
      chartDataForModal,
      closeSeriesPicker,
      enqueueSnackbar,
      markedPoints,
      markedXValues,
      visualConfig.icons,
      visualConfig.pendingLineColor,
    ]
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
  }, [clicks.length, clicksToRestoreOnUndo, closeSeriesPicker, seriesPickerOpen]);

  const onCancelFlow = useCallback(() => {
    setClicks([]);
    setMarkedPoints(null);
    closeSeriesPicker();
  }, [closeSeriesPicker]);

  const setMiddlePointColor = useCallback((color: string) => {
    setMarkedPoints((previousPoints) => {
      if (!previousPoints || previousPoints.length <= DETECT_POINT_MARK_MIDDLE_INDEX) {
        return previousPoints;
      }

      const nextPoints = [...previousPoints];
      nextPoints[DETECT_POINT_MARK_MIDDLE_INDEX] = {
        ...nextPoints[DETECT_POINT_MARK_MIDDLE_INDEX]!,
        color,
      };

      return nextPoints;
    });
  }, []);

  const pendingAdditionalShapes = useMemo<SeriesBoundShape[]>(() => {
    if (clicks.length > 0) {
      return clicks.map((click, clickIndex) =>
        createPendingLineShape(clickIndex, click.x, visualConfig.pendingLineColor)
      );
    }

    if (seriesPickerOpen && markedXValues) {
      return markedXValues.map((xValue, clickIndex) =>
        createPendingLineShape(clickIndex, xValue, visualConfig.pendingLineColor)
      );
    }

    return EMPTY_LINE_SHAPES;
  }, [clicks, markedXValues, seriesPickerOpen, visualConfig.pendingLineColor]);

  const additionalShapes = useMemo(
    () => [...confirmedShapes, ...pendingAdditionalShapes],
    [confirmedShapes, pendingAdditionalShapes]
  );

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
    [bindableIndicesBase, seriesPickerOpen, shouldFilterByVisibility]
  );

  const toggleShowShapesForHiddenSeries = useCallback(() => {
    setShowShapesForHiddenSeries((isVisible) => !isVisible);
  }, []);

  return {
    additionalShapes,
    additionalIcons: confirmedIcons,
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
