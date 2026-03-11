import type {
  ChartData,
  ChartDataSeries,
  ChartIcon,
  ChartOptions,
  ChartShape,
} from '../../../chart';

import type { DetectVisualConfig, DetectVisualIconOption } from '../detectVisualConfig';

export interface DetectPointCoordinates {
  x: number;
  y: number;
}

export interface PendingMarkedPoint {
  location: { x: number; y?: number };
  color?: string;
}

export type DetectMiddleClickEvent = MouseEvent & {
  chartXValue?: number;
  chartYValue?: number;
  getSeriesVisibility?: () => boolean[];
};

export type SeriesBoundShape = ChartShape & { seriesIndex?: number };
export type SeriesBoundIcon = ChartIcon & { seriesIndex?: number };

export interface DetectChartDataForModal {
  lines: ChartDataSeries[];
}

export interface DetectPointMarkFlowParams {
  data: ChartData | null;
  visualConfig: DetectVisualConfig;
}

export interface DetectPointMarkFlowModel {
  additionalShapes: SeriesBoundShape[];
  additionalIcons: SeriesBoundIcon[];
  seriesVisibility: boolean[];
  showShapesForHiddenSeries: boolean;
  seriesPickerOpen: boolean;
  markedPoints: PendingMarkedPoint[] | null;
  chartDataForModal: DetectChartDataForModal | null;
  bindableIndices: number[];
  bindableIndicesBase: number[];
  requestedSeriesIndex: number | null;
  setRequestedSeriesIndex: (seriesIndex: number | null) => void;
  setMiddlePointColor: (color: string) => void;
  handleMiddleClick: (event: MouseEvent) => void;
  confirmSeries: (seriesIndex: number) => void;
  onUndoLastClick: () => void;
  onCancelFlow: () => void;
  onSeriesVisibilityStateChange: (visibility: boolean[]) => void;
  toggleShowShapesForHiddenSeries: () => void;
}

export interface DetectChartModelParams {
  data: ChartData | null;
  options: ChartOptions;
  baseShapes: ChartShape[];
  baseIcons: ChartIcon[];
  additionalSeriesShapes: SeriesBoundShape[];
  additionalSeriesIcons: SeriesBoundIcon[];
  seriesVisibility: boolean[];
  showShapesForHiddenSeries: boolean;
  onMiddleClick: (event: MouseEvent) => void;
  onSeriesVisibilityStateChange: (visibility: boolean[]) => void;
}

export interface DetectModalModelParams {
  seriesPickerOpen: boolean;
  chartDataForModal: DetectChartDataForModal | null;
  bindableIndices: number[];
  bindableIndicesBase: number[];
  requestedSeriesIndex: number | null;
  markedPoints: PendingMarkedPoint[] | null;
  setSelectedSeriesIndex: (seriesIndex: number | null) => void;
  setMiddlePointColor: (color: string) => void;
  iconOptions: DetectVisualIconOption[];
  confirmSeries: (seriesIndex: number) => void;
  onUndoLastClick: () => void;
  onCancelFlow: () => void;
}
