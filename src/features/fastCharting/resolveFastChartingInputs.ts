import type { ChartIcon, ChartOptions, ChartShape } from '../../chart';

const EMPTY_FAST_CHARTING_OPTIONS: ChartOptions = {};
const EMPTY_FAST_CHARTING_SHAPES: ChartShape[] = [];
const EMPTY_FAST_CHARTING_ICONS: ChartIcon[] = [];

export interface ResolveFastChartingInputsParams {
  options?: ChartOptions;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
}

export interface ResolvedFastChartingInputs {
  options: ChartOptions;
  shapes: ChartShape[];
  icons: ChartIcon[];
}

export const resolveFastChartingInputs = ({
  options,
  shapes,
  icons,
}: ResolveFastChartingInputsParams): ResolvedFastChartingInputs => ({
  options: options ?? EMPTY_FAST_CHARTING_OPTIONS,
  shapes: shapes ?? EMPTY_FAST_CHARTING_SHAPES,
  icons: icons ?? EMPTY_FAST_CHARTING_ICONS,
});
