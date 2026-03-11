import { useCallback, useEffect, useMemo } from 'react';

import {
  DETECT_INVALID_SERIES_INDEX,
  DETECT_MODAL_CONFIRM_KEY,
  DETECT_POINT_MARK_MIDDLE_INDEX,
} from '../detectPointMarkConstants';
import type { DetectModalModelParams } from './detectPointMarkFlowTypes';

export const useDetectModal = ({
  seriesPickerOpen,
  chartDataForModal,
  bindableIndices,
  bindableIndicesBase,
  requestedSeriesIndex,
  markedPoints,
  setSelectedSeriesIndex,
  setMiddlePointColor,
  iconOptions,
  confirmSeries,
  onUndoLastClick,
  onCancelFlow,
}: DetectModalModelParams) => {
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
      return DETECT_INVALID_SERIES_INDEX;
    }

    if (requestedSeriesIndex != null && seriesOptions.includes(requestedSeriesIndex)) {
      return requestedSeriesIndex;
    }

    if (bindableIndices.length === 0) {
      return DETECT_INVALID_SERIES_INDEX;
    }

    const firstVisibleBindable = bindableIndices[0];
    if (firstVisibleBindable != null && seriesOptions.includes(firstVisibleBindable)) {
      return firstVisibleBindable;
    }

    return DETECT_INVALID_SERIES_INDEX;
  }, [bindableIndices, requestedSeriesIndex, seriesOptions, seriesPickerOpen]);

  const canConfirm =
    selectedSeriesIndex > DETECT_INVALID_SERIES_INDEX &&
    markedPoints?.[DETECT_POINT_MARK_MIDDLE_INDEX]?.color != null;

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
      if (event.key !== DETECT_MODAL_CONFIRM_KEY) {
        return;
      }

      event.preventDefault();
      onDone();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onDone, seriesPickerOpen]);

  return {
    open: seriesPickerOpen && !!chartDataForModal,
    iconOptions,
    selectedColor: markedPoints?.[DETECT_POINT_MARK_MIDDLE_INDEX]?.color,
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
