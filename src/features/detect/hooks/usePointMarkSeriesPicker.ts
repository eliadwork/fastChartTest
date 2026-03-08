import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';

import { DEFAULT_POINT_MARK_ICON_SVG } from '../../../assets/pointMarkIcon';
import { usePointMarkStore } from '../../../store/pointMarkStore';
import { getInterpolatedPointAtX } from '../../../utils/chartDataLookup';
import {
  DETECT_COLOR_HEX_BY_NAME,
  DETECT_POINT_MARK_COLORS,
} from '../detectConstants';
import { createPendingLineShape } from '../detectPointMarkUtils';

export const usePointMarkSeriesPicker = () => {
  const { enqueueSnackbar } = useSnackbar();

  const chartIdForModal = usePointMarkStore((state) => state.chartIdForModal);
  const seriesPickerOpen = usePointMarkStore((state) => state.seriesPickerOpen);
  const markedXValues = usePointMarkStore((state) => state.markedXValues);
  const markedPoints = usePointMarkStore((state) => state.markedPoints);
  const chartDataForModal = usePointMarkStore((state) => state.chartDataForModal);
  const bindableIndices = usePointMarkStore((state) => state.bindableIndices);
  const bindableIndicesBase = usePointMarkStore(
    (state) => state.bindableIndicesBase
  );
  const addShapes = usePointMarkStore((state) => state.addShapes);
  const addIcon = usePointMarkStore((state) => state.addIcon);
  const updateMarkedPointColor = usePointMarkStore(
    (state) => state.updateMarkedPointColor
  );
  const closeSeriesPicker = usePointMarkStore((state) => state.closeSeriesPicker);
  const undoLastClick = usePointMarkStore((state) => state.undoLastClick);
  const cancelFlow = usePointMarkStore((state) => state.cancelFlow);

  const [requestedSeriesIndex, setRequestedSeriesIndex] = useState<number | null>(
    null
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
    if (!seriesPickerOpen || seriesOptions.length === 0) {
      return -1;
    }

    if (
      requestedSeriesIndex != null &&
      seriesOptions.includes(requestedSeriesIndex)
    ) {
      return requestedSeriesIndex;
    }

    const firstVisibleIndex = bindableIndices[0];
    const preferVisible =
      firstVisibleIndex != null && seriesOptions.includes(firstVisibleIndex);

    return preferVisible ? firstVisibleIndex : seriesOptions[0] ?? -1;
  }, [
    seriesPickerOpen,
    seriesOptions,
    requestedSeriesIndex,
    bindableIndices,
  ]);

  const canConfirm =
    selectedSeriesIndex >= 0 && markedPoints?.[1]?.color != null;

  const handleConfirmSeries = useCallback(
    (seriesIndex: number) => {
      if (
        !markedPoints ||
        !markedXValues ||
        !chartDataForModal ||
        !chartIdForModal
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

      if (!leftPoint || !middlePoint || !rightPoint) {
        return;
      }

      const confirmedLineShapes = markedXValues.map((xValue, index) =>
        createPendingLineShape(index, xValue)
      );

      addShapes(chartIdForModal, confirmedLineShapes);

      const middleColor = markedPoints[1]?.color;
      addIcon(chartIdForModal, {
        iconImage: DEFAULT_POINT_MARK_ICON_SVG,
        location: middlePoint,
        color: middleColor ? DETECT_COLOR_HEX_BY_NAME[middleColor] : undefined,
      });

      enqueueSnackbar('Saved 3 points', { autoHideDuration: 3000 });
      setRequestedSeriesIndex(null);
      closeSeriesPicker();
    },
    [
      markedPoints,
      markedXValues,
      chartDataForModal,
      chartIdForModal,
      addShapes,
      addIcon,
      enqueueSnackbar,
      closeSeriesPicker,
    ]
  );

  const handleDone = useCallback(() => {
    if (!canConfirm) {
      return;
    }

    handleConfirmSeries(selectedSeriesIndex);
  }, [canConfirm, handleConfirmSeries, selectedSeriesIndex]);

  const handleUndoLastClick = useCallback(() => {
    if (!chartIdForModal) {
      return;
    }

    undoLastClick(chartIdForModal);
    setRequestedSeriesIndex(null);
  }, [chartIdForModal, undoLastClick]);

  const handleCancelFlow = useCallback(() => {
    if (!chartIdForModal) {
      return;
    }

    cancelFlow(chartIdForModal);
    setRequestedSeriesIndex(null);
  }, [chartIdForModal, cancelFlow]);

  useEffect(() => {
    if (!seriesPickerOpen) {
      return;
    }

    const onKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key !== 'Enter') {
        return;
      }

      keyboardEvent.preventDefault();
      handleDone();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [seriesPickerOpen, handleDone]);

  return {
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
  };
};
