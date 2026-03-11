import type { ChartIcon, ChartOptions, ChartShape } from '../../chart';

const EMPTY_DETECT_OPTIONS: ChartOptions = {};
const EMPTY_DETECT_SHAPES: ChartShape[] = [];
const EMPTY_DETECT_ICONS: ChartIcon[] = [];

export interface ResolveDetectInputsParams {
  options?: ChartOptions;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
}

export interface ResolvedDetectInputs {
  options: ChartOptions;
  shapes: ChartShape[];
  icons: ChartIcon[];
}

export const resolveDetectInputs = ({
  options,
  shapes,
  icons,
}: ResolveDetectInputsParams): ResolvedDetectInputs => ({
  options: options ?? EMPTY_DETECT_OPTIONS,
  shapes: shapes ?? EMPTY_DETECT_SHAPES,
  icons: icons ?? EMPTY_DETECT_ICONS,
});
