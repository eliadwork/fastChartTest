import type { ChartData, ChartIcon, ChartOptions, ChartShape, ChartStyle } from '../../chart/types';

import { Chart } from '../../chart/Chart';
import { ShapesVisibilityToolbarButton } from './component/ShapesVisibilityToolbarButton';
import { SeriesPickerModal } from './component/popupModal/SeriesPickerModal';
import {
  useDetectChart,
  useDetectModal,
  useDetectPointMarkFlow,
} from './hooks/useDetectPointMarkFlow';

export interface DetectProps {
  chartId: string;
  data: ChartData | null;
  title?: string;
  style?: ChartStyle;
  options?: ChartOptions;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  className?: string;
}

export const Detect = ({
  chartId,
  data,
  title,
  style,
  options = {},
  shapes = [],
  icons = [],
  className,
}: DetectProps) => {
  const detectPointMarkFlow = useDetectPointMarkFlow({
    data,
  });
  const {
    additionalShapes,
    additionalIcons,
    seriesVisibility,
    showShapesForHiddenSeries,
    handleMiddleClick,
    onSeriesVisibilityStateChange,
    toggleShowShapesForHiddenSeries,
  } = detectPointMarkFlow;
  const { chartOptions, finalShapes, finalIcons, onSeriesVisibilityChange } = useDetectChart({
    data,
    options,
    baseShapes: shapes,
    baseIcons: icons,
    additionalBindedShapes: additionalShapes,
    additionalBindedIcons: additionalIcons,
    seriesVisibility,
    showShapesForHiddenSeries,
    onMiddleClick: handleMiddleClick,
    onSeriesVisibilityStateChange,
    toggleShowShapesForHiddenSeries,
  });

  const {
    open,
    colorOptions,
    selectedColor,
    seriesOptions,
    seriesNames,
    selectedSeriesIndex,
    canConfirm,
    setSelectedSeriesIndex,
    setMiddlePointColor,
    onDone,
    onUndoLastClick,
    onCancelFlow,
  } = useDetectModal({
    seriesPickerOpen: detectPointMarkFlow.seriesPickerOpen,
    chartDataForModal: detectPointMarkFlow.chartDataForModal,
    bindableIndices: detectPointMarkFlow.bindableIndices,
    bindableIndicesBase: detectPointMarkFlow.bindableIndicesBase,
    requestedSeriesIndex: detectPointMarkFlow.requestedSeriesIndex,
    markedPoints: detectPointMarkFlow.markedPoints,
    setSelectedSeriesIndex: detectPointMarkFlow.setRequestedSeriesIndex,
    setMiddlePointColor: detectPointMarkFlow.setMiddlePointColor,
    confirmSeries: detectPointMarkFlow.confirmSeries,
    onUndoLastClick: detectPointMarkFlow.onUndoLastClick,
    onCancelFlow: detectPointMarkFlow.onCancelFlow,
  });

  const shapesVisibilityToolbar = ({ textColor }: { textColor: string }) => (
    <ShapesVisibilityToolbarButton
      textColor={textColor}
      showShapesForHiddenSeries={showShapesForHiddenSeries}
      onToggle={toggleShowShapesForHiddenSeries}
    />
  );

  return (
    <div className={className}>
      <Chart
        chartId={chartId}
        data={data}
        title={title}
        options={chartOptions}
        shapes={finalShapes}
        icons={finalIcons}
        chartStyle={style}
        onSeriesVisibilityChange={onSeriesVisibilityChange}
        toolbarSlot={shapesVisibilityToolbar}
      />
      <SeriesPickerModal
        open={open}
        colorOptions={colorOptions}
        selectedColor={selectedColor}
        seriesOptions={seriesOptions}
        seriesNames={seriesNames}
        selectedSeriesIndex={selectedSeriesIndex}
        canConfirm={canConfirm}
        onColorChange={setMiddlePointColor}
        onSeriesChange={(seriesIndex) => setSelectedSeriesIndex(seriesIndex)}
        onDone={onDone}
        onUndoLastClick={onUndoLastClick}
        onCancelFlow={onCancelFlow}
      />
    </div>
  );
};
