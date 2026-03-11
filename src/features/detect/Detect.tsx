import type { ChartData, ChartIcon, ChartOptions, ChartShape, ChartStyle } from '../../chart/types';

import { useMemo } from 'react';

import { Chart } from '../../chart/Chart';
import { ShapesVisibilityToolbarButton } from './component/ShapesVisibilityToolbarButton';
import { SeriesPickerModal } from './component/popupModal/SeriesPickerModal';
import { resolveDetectVisualConfig } from './detectVisualConfig';
import {
  useDetectChart,
  useDetectModal,
  useDetectPointMarkFlow,
} from './hooks/useDetectPointMarkFlow';
import type { DetectVisualConfig } from './detectVisualConfig';

export interface DetectProps {
  chartId: string;
  data: ChartData | null;
  title?: string;
  style?: ChartStyle;
  options?: ChartOptions;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  visualConfig?: Partial<DetectVisualConfig>;
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
  visualConfig,
  className,
}: DetectProps) => {
  const resolvedVisualConfig = useMemo(
    () => resolveDetectVisualConfig(visualConfig),
    [visualConfig]
  );

  const detectPointMarkFlow = useDetectPointMarkFlow({
    data,
    visualConfig: resolvedVisualConfig,
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
    additionalSeriesShapes: additionalShapes,
    additionalSeriesIcons: additionalIcons,
    seriesVisibility,
    showShapesForHiddenSeries,
    onMiddleClick: handleMiddleClick,
    onSeriesVisibilityStateChange,
  });

  const {
    open,
    iconOptions,
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
    iconOptions: resolvedVisualConfig.icons,
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
        iconOptions={iconOptions}
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
