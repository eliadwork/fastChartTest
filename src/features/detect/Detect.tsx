import type { ChartData, ChartOptions, ChartShape, ChartStyle } from '../../chart/types';

import { Chart } from '../../chart/Chart';
import { useDetectPointMarkFlow } from './hooks/useDetectPointMarkFlow';
import { SeriesPickerModal } from './SeriesPickerModal';

export interface DetectProps {
  chartId: string;
  data: ChartData | null;
  title?: string;
  style?: ChartStyle;
  options?: ChartOptions;
  shapes?: ChartShape[];
  icons?: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>;
  /** Forwarded to root element for styled(Detect). */
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
  const {
    chartOptions,
    chartShapes,
    chartIcons,
    colorOptions,
    selectedColor,
    seriesPickerState,
    canConfirm,
    setSelectedSeriesIndex,
    setMiddlePointColor,
    onDone,
    onUndoLastClick,
    onCancelFlow,
    onSeriesVisibilityChange,
  } = useDetectPointMarkFlow({
    chartId,
    data,
    options,
    shapes,
    icons,
  });

  return (
    <div className={className}>
      <Chart
        chartId={chartId}
        data={data}
        title={title}
        options={chartOptions}
        shapes={chartShapes}
        icons={chartIcons}
        chartStyle={style}
        onSeriesVisibilityChange={onSeriesVisibilityChange}
      />
      <SeriesPickerModal
        open={seriesPickerState.open}
        colorOptions={colorOptions}
        selectedColor={selectedColor}
        seriesOptions={seriesPickerState.seriesOptions}
        seriesNames={seriesPickerState.seriesNames}
        selectedSeriesIndex={seriesPickerState.selectedSeriesIndex}
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
