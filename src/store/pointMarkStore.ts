import { create } from 'zustand'

export interface ChartDataForModal {
  x: ArrayLike<number> | number[]
  ys: (ArrayLike<number> | number[])[]
  seriesNames?: string[]
}

export type PointMarkColor = 'red' | 'green' | 'yellow'

export interface PointMarkOptions {
  seriesBindable?: boolean[]
  seriesVisibility?: boolean[]
  onValidationError?: (message: string) => void
  onComplete?: (chartId: string) => void
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

const DEFAULT_LINE_COLOR = '#ff0000'

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

/** Pending point: y is optional until series is chosen. */
export interface MarkedPointPending {
  location: { x: number; y?: number }
  color?: PointMarkColor
}

/** Final saved point: x and y required, color optional. */
export interface MarkedPointFinal {
  location: { x: number; y: number }
  color?: PointMarkColor
}

interface PointMarkState {
  clicksByChart: Record<string, { x: number; y: number }[]>
  markedXValues: [number, number, number] | null
  markedPoints: MarkedPointPending[] | null
  markedYValue: number | null
  chartDataForModal: ChartDataForModal | null
  chartIdForModal: string | null
  bindableIndices: number[]
  seriesPickerOpen: boolean
  pointMarkersByChart: Record<string, PointMarker[]>
  iconsByChart: Record<string, ChartIcon[]>
}

interface PointMarkActions {
  addPointMark: (
    chartId: string,
    xValue: number,
    yValue: number,
    chartData: ChartDataForModal,
    options?: PointMarkOptions
  ) => PointMarkResult | null
  addPointMarker: (chartId: string, marker: PointMarker) => void
  addIcon: (chartId: string, icon: ChartIcon) => void
  updateMarkedPointColor: (index: number, color: PointMarkColor | undefined) => void
  closeSeriesPicker: () => void
}

export const usePointMarkStore = create<PointMarkState & PointMarkActions>(
  (set, get) => ({
    clicksByChart: {},
    markedXValues: null,
    markedPoints: null,
    markedYValue: null,
    chartDataForModal: null,
    chartIdForModal: null,
    bindableIndices: [],
    seriesPickerOpen: false,
    pointMarkersByChart: {},
    iconsByChart: {},

    addPointMark: (chartId, xValue, yValue, chartData, options) => {
      const { clicksByChart } = get()
      const clicks = [...(clicksByChart[chartId] ?? []), { x: xValue, y: yValue }]
      const index = clicks.length - 1
      const seriesCount = chartData.ys?.length ?? 0

      const seriesBindable = options?.seriesBindable

      const bindableIndices =
        seriesBindable != null
          ? Array.from({ length: seriesCount }, (_, i) => i).filter((i) => seriesBindable[i] !== false)
          : Array.from({ length: seriesCount }, (_, i) => i)

      if (clicks.length === 3) {
        const x1 = clicks[0].x
        const x2 = clicks[1].x
        const x3 = clicks[2].x
        const minX = Math.min(x1, x3)
        const maxX = Math.max(x1, x3)
        const middleBetweenEnds = minX <= x2 && x2 <= maxX

        if (!middleBetweenEnds) {
          options?.onValidationError?.('Pick must be between the two shoulders.')
          set({
            clicksByChart: { ...clicksByChart, [chartId]: [clicks[0], clicks[1]] },
          })
          return null
        }

        const points: MarkedPointPending[] = [
          { location: { x: clicks[0].x } },
          { location: { x: clicks[1].x, y: clicks[1].y }, color: 'red' },
          { location: { x: clicks[2].x } },
        ]
        const openModal = bindableIndices.length > 0

        set({
          clicksByChart: { ...clicksByChart, [chartId]: [] },
          markedXValues: [clicks[0].x, clicks[1].x, clicks[2].x],
          markedPoints: points,
          markedYValue: clicks[1].y,
          chartDataForModal: openModal ? chartData : null,
          chartIdForModal: openModal ? chartId : null,
          bindableIndices: openModal ? bindableIndices : [],
          seriesPickerOpen: openModal,
        })

      }

      if (bindableIndices.length === 0) {
        return []
      }

      if (clicks.length !== 3) {
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

    updateMarkedPointColor: (index, color) =>
      set((s) => {
        if (!s.markedPoints || index < 0 || index >= s.markedPoints.length) return s
        const next = [...s.markedPoints]
        const prev = next[index]!
        if (color === undefined) {
          const { color: _c, ...rest } = prev
          next[index] = rest as MarkedPointPending
        } else {
          next[index] = { ...prev, color }
        }
        return { markedPoints: next }
      }),

    closeSeriesPicker: () =>
      set({
        markedXValues: null,
        markedPoints: null,
        markedYValue: null,
        chartDataForModal: null,
        chartIdForModal: null,
        bindableIndices: [],
        seriesPickerOpen: false,
      }),
  })
)
