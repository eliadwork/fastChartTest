import type {
  ChartData,
  ChartIcon,
  ChartImplementationProps,
  ChartOptions,
  ChartShape,
  ChartStyle,
} from '../../chart';

import { Chart } from '../../chart';
import { resolveFastChartingInputs } from './resolveFastChartingInputs';
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
  implementationComponent: React.ComponentType<ChartImplementationProps>;
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
  options,
  shapes,
  icons,
  implementationComponent,
  fill = false,
  className,
}: FastChartingProps) => {
  const resolvedInputs = resolveFastChartingInputs({ options, shapes, icons });
  const { width, height, resizeHandleProps } = useResizableChart();
  const resizedChartDimensions = fill ? undefined : { width, height };

  return (
    <FastChartingRoot
      className={className}
      $fill={fill}
      $resizedWidth={resizedChartDimensions?.width}
      $resizedHeight={resizedChartDimensions?.height}
    >
      <FastChartingChartWrapper>
        <Chart
          chartId={chartId}
          data={data}
          title={title}
          options={resolvedInputs.options}
          shapes={resolvedInputs.shapes}
          icons={resolvedInputs.icons}
          chartStyle={style}
          implementationComponent={implementationComponent}
        />
      </FastChartingChartWrapper>
      {!fill && <FastChartingResizeHandle {...resizeHandleProps} />}
    </FastChartingRoot>
  );
};
