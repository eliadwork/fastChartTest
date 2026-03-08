import type { ChartData, ChartOptions, ChartShape, ChartStyle } from '../../chart/types';

import { Chart } from '../../chart/Chart';
import { useDetectPointMarkFlow } from './hooks/useDetectPointMarkFlow';
import { usePointMarkSeriesPicker } from './hooks/usePointMarkSeriesPicker';
import { SeriesPickerModal } from './SeriesPickerModal';

export interface DetectProps {
  chartId: string;
  data: ChartData | null;
  title?: string;
  style: ChartStyle;
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
  const { chartOptions, chartShapes, chartIcons } = useDetectPointMarkFlow({
    chartId,
    data,
    options,
    shapes,
    icons,
  });

  const {
    colorOptions,
    selectedColor,
    seriesPickerState,
    canConfirm,
    setSelectedSeriesIndex,
    setMiddlePointColor,
    onDone,
    onUndoLastClick,
    onCancelFlow,
  } = usePointMarkSeriesPicker();

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
