import { create } from 'zustand'

export interface ChartDataForModal {
  x: ArrayLike<number> | number[]
  ys: (ArrayLike<number> | number[])[]
  seriesNames?: string[]
}

export interface ChartShapeForMark {
  color: string
  axis: 'x'
  value: number
  strokeDashArray?: number[]
}

export interface ChartMarkerForMark {
  type: 'marker'
  x: number
  icon?: string
  color?: string
}

export type PointMarkResult = ChartShapeForMark | ChartMarkerForMark | (ChartShapeForMark | ChartMarkerForMark)[]

const DEFAULT_LINE_COLOR = '#3388ff'

function createShapeForIndex(index: number, xValue: number): ChartShapeForMark {
  const strokeDashArray = index === 1 ? [8, 4] : undefined
  return {
    color: DEFAULT_LINE_COLOR,
    axis: 'x',
    value: xValue,
    strokeDashArray,
  }
}

export interface PointMarker {
  x: number
  y: number
  icon?: string
  color?: string
}

import type { ChartIcon } from '../chart/types'
export type { ChartIcon }

interface PointMarkState {
  clicksByChart: Record<string, { x: number; y: number }[]>
  markedXValues: [number, number, number] | null
  markedYValue: number | null
  chartDataForModal: ChartDataForModal | null
  chartIdForModal: string | null
  seriesPickerOpen: boolean
  pointMarkersByChart: Record<string, PointMarker[]>
  iconsByChart: Record<string, ChartIcon[]>
}

interface PointMarkActions {
  addPointMark: (chartId: string, xValue: number, yValue: number, chartData: ChartDataForModal) => PointMarkResult | null
  addPointMarker: (chartId: string, marker: PointMarker) => void
  addIcon: (chartId: string, icon: ChartIcon) => void
  closeSeriesPicker: () => void
}

export const usePointMarkStore = create<PointMarkState & PointMarkActions>(
  (set, get) => ({
    clicksByChart: {},
    markedXValues: null,
    markedYValue: null,
    chartDataForModal: null,
    chartIdForModal: null,
    seriesPickerOpen: false,
    pointMarkersByChart: {},
    iconsByChart: {},

    addPointMark: (chartId, xValue, yValue, chartData) => {
      const { clicksByChart } = get()
      const clicks = [...(clicksByChart[chartId] ?? []), { x: xValue, y: yValue }]
      const index = clicks.length - 1

      if (clicks.length === 3) {
        set({
          clicksByChart: { ...clicksByChart, [chartId]: [] },
          markedXValues: [clicks[0].x, clicks[1].x, clicks[2].x],
          markedYValue: clicks[1].y,
          chartDataForModal: chartData,
          chartIdForModal: chartId,
          seriesPickerOpen: true,
        })
      } else {
        set({
          clicksByChart: { ...clicksByChart, [chartId]: clicks },
        })
      }

      const lineShape = createShapeForIndex(index, xValue)
      if (index === 1) {
        return [lineShape]
      }
      return lineShape
    },

    addPointMarker: (chartId, marker) =>
      set((s) => ({
        pointMarkersByChart: {
          ...s.pointMarkersByChart,
          [chartId]: [...(s.pointMarkersByChart[chartId] ?? []), marker],
        },
      })),

    addIcon: (chartId, icon) =>
      set((s) => ({
        iconsByChart: {
          ...s.iconsByChart,
          [chartId]: [...(s.iconsByChart[chartId] ?? []), icon],
        },
      })),

    closeSeriesPicker: () =>
      set({
        markedXValues: null,
        markedYValue: null,
        chartDataForModal: null,
        chartIdForModal: null,
        seriesPickerOpen: false,
      }),
  })
)
