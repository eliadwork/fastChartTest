import type { ChartDataSeries, ChartIcon, ChartLineShape } from '../chart/types';

import { create } from 'zustand';

export interface ChartDataForModal {
  lines: ChartDataSeries[];
}

export type PointMarkColor = 'red' | 'green' | 'yellow';

export interface PointMarkOptions {
  seriesBindable?: boolean[];
  seriesVisibility?: boolean[];
  onValidationError?: (message: string) => void;
  onComplete?: (chartId: string) => void;
}

export interface ChartShapeForMark {
  color: string;
  axis: 'x';
  value: number;
  dash?: { isDash: boolean; steps: number[] };
}

export interface ChartMarkerForMark {
  type: 'marker';
  x: number;
  icon?: string;
  color?: string;
}

export type PointMarkResult =
  | ChartShapeForMark
  | ChartMarkerForMark
  | (ChartShapeForMark | ChartMarkerForMark)[];

const DEFAULT_LINE_COLOR = '#ff0000';

const createShapeForIndex = (
  index: number,
  xValue: number
): ChartShapeForMark => {
  const dash = index === 1 ? { isDash: true, steps: [8, 4] } : undefined;
  return {
    color: DEFAULT_LINE_COLOR,
    axis: 'x',
    value: xValue,
    dash,
  };
};

export interface MarkedPointPending {
  location: { x: number; y?: number };
  color?: PointMarkColor;
}

export interface MarkedPointFinal {
  location: { x: number; y: number };
  color?: PointMarkColor;
}

interface PointMarkState {
  clicksByChart: Record<string, { x: number; y: number }[]>;
  clicksToRestoreOnCancel: Record<string, { x: number; y: number }[]>;
  markedXValues: [number, number, number] | null;
  markedPoints: MarkedPointPending[] | null;
  markedYValue: number | null;
  chartDataForModal: ChartDataForModal | null;
  chartIdForModal: string | null;
  bindableIndices: number[];
  bindableIndicesBase: number[];
  seriesPickerOpen: boolean;
  iconsByChart: Record<string, ChartIcon[]>;
  shapesByChart: Record<string, ChartLineShape[]>;
}

interface PointMarkActions {
  addPointMark: (
    chartId: string,
    xValue: number,
    yValue: number,
    chartData: ChartDataForModal,
    options?: PointMarkOptions
  ) => PointMarkResult | null;
  addIcon: (chartId: string, icon: ChartIcon) => void;
  addShapes: (chartId: string, shapes: ChartLineShape[]) => void;
  updateMarkedPointColor: (index: number, color: PointMarkColor | undefined) => void;
  closeSeriesPicker: () => void;
  cancelSeriesPickerWithoutChoice: (chartId: string) => void;
  /** Undo last click: in modal → restore to 2 clicks; during 1–2 clicks → remove last. */
  undoLastClick: (chartId: string) => void;
  /** Cancel entire 3-click flow: close modal and clear all pending clicks. */
  cancelFlow: (chartId: string) => void;
  updateModalSeriesVisibility: (visibility: boolean[]) => void;
}

export const usePointMarkStore = create<PointMarkState & PointMarkActions>(
  (setState, getState) => ({
    clicksByChart: {},
    clicksToRestoreOnCancel: {},
    markedXValues: null,
    markedPoints: null,
    markedYValue: null,
    chartDataForModal: null,
    chartIdForModal: null,
    bindableIndices: [],
    bindableIndicesBase: [],
    seriesPickerOpen: false,
    iconsByChart: {},
    shapesByChart: {},

    addPointMark: (chartId, xValue, yValue, chartData, options) => {
      const { clicksByChart } = getState();
      const clicks = [...(clicksByChart[chartId] ?? []), { x: xValue, y: yValue }];
      const index = clicks.length - 1;
      const seriesCount = chartData.lines?.length ?? 0;

      const seriesBindable = options?.seriesBindable;
      const seriesVisibility = options?.seriesVisibility;

      let bindableIndices = Array.from(
        { length: seriesCount },
        (_, seriesIndex) => seriesIndex
      );

      if (seriesBindable != null) {
        bindableIndices = bindableIndices.filter(
          (seriesIndex) => seriesBindable[seriesIndex] !== false
        );
      }

      if (seriesVisibility != null && seriesVisibility.length > 0) {
        bindableIndices = bindableIndices.filter(
          (seriesIndex) => seriesVisibility[seriesIndex] !== false
        );
      }

      if (clicks.length === 3) {
        const firstX = clicks[0].x;
        const middleX = clicks[1].x;
        const thirdX = clicks[2].x;
        const minimumX = Math.min(firstX, thirdX);
        const maximumX = Math.max(firstX, thirdX);
        const middleBetweenEnds = minimumX <= middleX && middleX <= maximumX;

        if (!middleBetweenEnds) {
          options?.onValidationError?.('Pick must be between the two shoulders.');
          setState({
            clicksByChart: { ...clicksByChart, [chartId]: [clicks[0], clicks[1]] },
          });
          return null;
        }

        const points: MarkedPointPending[] = [
          { location: { x: clicks[0].x } },
          { location: { x: clicks[1].x, y: clicks[1].y } },
          { location: { x: clicks[2].x } },
        ];

        const bindableIndicesBase =
          seriesBindable != null
            ? Array.from({ length: seriesCount }, (_, seriesIndex) => seriesIndex).filter(
                (seriesIndex) => seriesBindable[seriesIndex] !== false
              )
            : Array.from({ length: seriesCount }, (_, seriesIndex) => seriesIndex);

        const openModal = bindableIndicesBase.length > 0;

        setState({
          clicksByChart: { ...clicksByChart, [chartId]: [] },
          clicksToRestoreOnCancel: {
            ...getState().clicksToRestoreOnCancel,
            [chartId]: [clicks[0], clicks[1]],
          },
          markedXValues: [clicks[0].x, clicks[1].x, clicks[2].x],
          markedPoints: points,
          markedYValue: clicks[1].y,
          chartDataForModal: openModal ? chartData : null,
          chartIdForModal: openModal ? chartId : null,
          bindableIndices: openModal ? bindableIndices : [],
          bindableIndicesBase: openModal ? bindableIndicesBase : [],
          seriesPickerOpen: openModal,
        });
      }

      if (bindableIndices.length === 0) {
        return [];
      }

      if (clicks.length !== 3) {
        setState({
          clicksByChart: { ...clicksByChart, [chartId]: clicks },
        });
      }

      const lineShape = createShapeForIndex(index, xValue);
      return index === 1 ? [lineShape] : lineShape;
    },

    addIcon: (chartId, icon) =>
      setState((state) => ({
        iconsByChart: {
          ...state.iconsByChart,
          [chartId]: [...(state.iconsByChart[chartId] ?? []), icon],
        },
      })),

    addShapes: (chartId, shapes) =>
      setState((state) => ({
        shapesByChart: {
          ...state.shapesByChart,
          [chartId]: [...(state.shapesByChart[chartId] ?? []), ...shapes],
        },
      })),

    updateMarkedPointColor: (index, color) =>
      setState((state) => {
        if (!state.markedPoints || index < 0 || index >= state.markedPoints.length) {
          return state;
        }

        const nextMarkedPoints = [...state.markedPoints];
        const previousPoint = nextMarkedPoints[index]!;

        if (color === undefined) {
          const { color: previousColor, ...restPoint } = previousPoint;
          void previousColor;
          nextMarkedPoints[index] = restPoint as MarkedPointPending;
        } else {
          nextMarkedPoints[index] = { ...previousPoint, color };
        }

        return { markedPoints: nextMarkedPoints };
      }),

    closeSeriesPicker: () =>
      setState(() => ({
        clicksToRestoreOnCancel: {},
        markedXValues: null,
        markedPoints: null,
        markedYValue: null,
        chartDataForModal: null,
        chartIdForModal: null,
        bindableIndices: [],
        bindableIndicesBase: [],
        seriesPickerOpen: false,
      })),

    cancelSeriesPickerWithoutChoice: (chartId) =>
      setState((state) => {
        const clicksToRestore = state.clicksToRestoreOnCancel[chartId];
        if (!clicksToRestore) {
          return state;
        }

        const nextClicksToRestoreOnCancel = { ...state.clicksToRestoreOnCancel };
        delete nextClicksToRestoreOnCancel[chartId];

        return {
          clicksByChart: { ...state.clicksByChart, [chartId]: clicksToRestore },
          clicksToRestoreOnCancel: nextClicksToRestoreOnCancel,
          markedXValues: null,
          markedPoints: null,
          markedYValue: null,
          chartDataForModal: null,
          chartIdForModal: null,
          bindableIndices: [],
          bindableIndicesBase: [],
          seriesPickerOpen: false,
        };
      }),

    undoLastClick: (chartId) =>
      setState((state) => {
        if (state.seriesPickerOpen && state.chartIdForModal === chartId) {
          const clicksToRestore = state.clicksToRestoreOnCancel[chartId];
          if (!clicksToRestore) {
            return state;
          }
          const nextClicksToRestoreOnCancel = { ...state.clicksToRestoreOnCancel };
          delete nextClicksToRestoreOnCancel[chartId];
          return {
            clicksByChart: { ...state.clicksByChart, [chartId]: clicksToRestore },
            clicksToRestoreOnCancel: nextClicksToRestoreOnCancel,
            markedXValues: null,
            markedPoints: null,
            markedYValue: null,
            chartDataForModal: null,
            chartIdForModal: null,
            bindableIndices: [],
            bindableIndicesBase: [],
            seriesPickerOpen: false,
          };
        }

        const clicks = state.clicksByChart[chartId];
        if (!clicks || clicks.length === 0) {
          return state;
        }
        const nextClicks = clicks.slice(0, -1);
        return {
          clicksByChart: {
            ...state.clicksByChart,
            [chartId]: nextClicks.length > 0 ? nextClicks : [],
          },
        };
      }),

    cancelFlow: (chartId) =>
      setState((state) => {
        const isModalOpen =
          state.seriesPickerOpen && state.chartIdForModal === chartId;
        const hasClicks =
          (state.clicksByChart[chartId]?.length ?? 0) > 0 ||
          state.clicksToRestoreOnCancel[chartId] != null;

        if (!isModalOpen && !hasClicks) {
          return state;
        }

        const nextClicksToRestoreOnCancel = { ...state.clicksToRestoreOnCancel };
        delete nextClicksToRestoreOnCancel[chartId];

        return {
          clicksByChart: { ...state.clicksByChart, [chartId]: [] },
          clicksToRestoreOnCancel: nextClicksToRestoreOnCancel,
          markedXValues: null,
          markedPoints: null,
          markedYValue: null,
          chartDataForModal: null,
          chartIdForModal: null,
          bindableIndices: [],
          bindableIndicesBase: [],
          seriesPickerOpen: false,
        };
      }),

    updateModalSeriesVisibility: (visibility) =>
      setState((state) => {
        if (!state.seriesPickerOpen || state.bindableIndicesBase.length === 0) {
          return state;
        }

        const bindableIndices = state.bindableIndicesBase.filter(
          (seriesIndex) => visibility[seriesIndex] !== false
        );

        return { bindableIndices };
      }),
  })
);
