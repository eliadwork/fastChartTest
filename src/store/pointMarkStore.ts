import { create } from 'zustand'

import type { ChartDataSeries } from '../chart'

export interface ChartDataForModal {
  lines: ChartDataSeries[]
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
  dash?: { isDash: boolean; steps: number[] }
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
  const dash = index === 1 ? { isDash: true, steps: [8, 4] } : undefined
  return {
    color: DEFAULT_LINE_COLOR,
    axis: 'x',
    value: xValue,
    dash,
  }
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
  /** First two clicks, stored when modal opens, used to restore on cancel-without-choice */
  clicksToRestoreOnCancel: Record<string, { x: number; y: number }[]>
  markedXValues: [number, number, number] | null
  markedPoints: MarkedPointPending[] | null
  markedYValue: number | null
  chartDataForModal: ChartDataForModal | null
  chartIdForModal: string | null
  bindableIndices: number[]
  /** Base bindable indices (from seriesBindable only), used to recompute when visibility changes */
  bindableIndicesBase: number[]
  seriesPickerOpen: boolean
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
  addIcon: (chartId: string, icon: ChartIcon) => void
  updateMarkedPointColor: (index: number, color: PointMarkColor | undefined) => void
  closeSeriesPicker: () => void
  /** Close modal without choice: restore first two clicks so next click is third again */
  cancelSeriesPickerWithoutChoice: (chartId: string) => void
  /** Update bindable indices when series visibility changes (e.g. user toggles in legend) */
  updateModalSeriesVisibility: (visibility: boolean[]) => void
}

export const usePointMarkStore = create<PointMarkState & PointMarkActions>(
  (set, get) => ({
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

    addPointMark: (chartId, xValue, yValue, chartData, options) => {
      const { clicksByChart } = get()
      const clicks = [...(clicksByChart[chartId] ?? []), { x: xValue, y: yValue }]
      const index = clicks.length - 1
      const seriesCount = chartData.lines?.length ?? 0

      const seriesBindable = options?.seriesBindable
      const seriesVisibility = options?.seriesVisibility

      let bindableIndices = Array.from({ length: seriesCount }, (_, i) => i)
      if (seriesBindable != null) {
        bindableIndices = bindableIndices.filter((i) => seriesBindable[i] !== false)
      }
      if (seriesVisibility != null && seriesVisibility.length > 0) {
        bindableIndices = bindableIndices.filter((i) => seriesVisibility[i] !== false)
      }

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
          { location: { x: clicks[1].x, y: clicks[1].y } },
          { location: { x: clicks[2].x } },
        ]
        const bindableIndicesBase =
          seriesBindable != null
            ? Array.from({ length: seriesCount }, (_, i) => i).filter((i) => seriesBindable![i] !== false)
            : Array.from({ length: seriesCount }, (_, i) => i)
        const openModal = bindableIndices.length > 0

        set({
          clicksByChart: { ...clicksByChart, [chartId]: [] },
          clicksToRestoreOnCancel: { ...get().clicksToRestoreOnCancel, [chartId]: [clicks[0], clicks[1]] },
          markedXValues: [clicks[0].x, clicks[1].x, clicks[2].x],
          markedPoints: points,
          markedYValue: clicks[1].y,
          chartDataForModal: openModal ? chartData : null,
          chartIdForModal: openModal ? chartId : null,
          bindableIndices: openModal ? bindableIndices : [],
          bindableIndicesBase: openModal ? bindableIndicesBase : [],
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
      set(() => ({
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
      set((s) => {
        const toRestore = s.clicksToRestoreOnCancel[chartId]
        if (!toRestore) return s
        return {
          clicksByChart: { ...s.clicksByChart, [chartId]: toRestore },
          clicksToRestoreOnCancel: (() => {
            const next = { ...s.clicksToRestoreOnCancel }
            delete next[chartId]
            return next
          })(),
          markedXValues: null,
          markedPoints: null,
          markedYValue: null,
          chartDataForModal: null,
          chartIdForModal: null,
          bindableIndices: [],
          bindableIndicesBase: [],
          seriesPickerOpen: false,
        }
      }),

    updateModalSeriesVisibility: (visibility) =>
      set((s) => {
        if (!s.seriesPickerOpen || s.bindableIndicesBase.length === 0) return s
        const bindableIndices = s.bindableIndicesBase.filter((i) => visibility[i] !== false)
        return { bindableIndices }
      }),
  })
)
