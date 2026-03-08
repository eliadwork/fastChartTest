import type { ChartData, ChartOptions, ChartShape, ChartStyle } from '../../chart/types';

import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { Chart } from '../../chart/Chart';
import { ChartToolbarButton } from '../../chart/ChartToolbarButton';
import { useDetectPointMarkFlow } from './hooks/useDetectPointMarkFlow';
import { SeriesPickerModal } from './SeriesPickerModal';
import {
  DETECT_TOOLTIP_HIDE_SHAPES_FOR_HIDDEN,
  DETECT_TOOLTIP_SHOW_SHAPES_FOR_HIDDEN,
} from './detectConstants';

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
    showShapesForHiddenSeries,
    toggleShowShapesForHiddenSeries,
  } = useDetectPointMarkFlow({
    chartId,
    data,
    options,
    shapes,
    icons,
  });

  const shapesVisibilityToolbar = ({ textColor }: { textColor: string }) => (
    <ChartToolbarButton
      tooltip={
        showShapesForHiddenSeries
          ? DETECT_TOOLTIP_HIDE_SHAPES_FOR_HIDDEN
          : DETECT_TOOLTIP_SHOW_SHAPES_FOR_HIDDEN
      }
      textColor={textColor}
      onClick={toggleShowShapesForHiddenSeries}
      sx={showShapesForHiddenSeries ? { opacity: 1 } : { opacity: 0.6 }}
    >
      {showShapesForHiddenSeries ? (
        <LayersIcon />
      ) : (
        <LayersClearIcon />
      )}
    </ChartToolbarButton>
  );

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
        toolbarSlot={shapesVisibilityToolbar}
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
