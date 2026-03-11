import type {
  ChartData,
  ChartIcon,
  ChartOptions,
  ChartShape,
  ChartStyle,
} from '../../chart/types';

import { Chart } from '../../chart/Chart';
import { useResizableChart } from './hooks/useResizableChart';
import {
  FastChartingChartWrapper,
  FastChartingResizeHandle,
  FastChartingRoot,
} from './FastChartingStyled';

export interface FastChartingProps {
  chartId: string;
  data: ChartData | null;
  title?: string;
  style?: ChartStyle;
  options?: ChartOptions;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  /** When true, fills container (100% width/height). When false, uses draggable resize. */
  fill?: boolean;
  /** Forwarded to root element for styled(FastCharting). */
  className?: string;
}

export const FastCharting = ({
  chartId,
  data,
  title,
  style,
  options = {},
  shapes = [],
  icons = [],
  fill = false,
  className,
}: FastChartingProps) => {
  const { width, height, resizeHandleProps } = useResizableChart();

  return (
    <FastChartingRoot
      className={className}
      style={fill ? { width: '100%', height: '100%' } : { width, height }}
    >
      <FastChartingChartWrapper>
        <Chart
          chartId={chartId}
          data={data}
          title={title}
          options={options}
          shapes={shapes}
          icons={icons}
          chartStyle={style}
        />
      </FastChartingChartWrapper>
      {!fill && <FastChartingResizeHandle {...resizeHandleProps} />}
    </FastChartingRoot>
  );
};
