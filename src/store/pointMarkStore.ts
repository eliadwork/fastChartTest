import { create } from 'zustand'
import { DEFAULT_POINT_MARK_ICON_SVG } from '../chartTheme'
import { getInterpolatedPointAtX } from '../utils/chartDataLookup'

export interface ChartDataForModal {
  x: ArrayLike<number> | number[]
  ys: (ArrayLike<number> | number[])[]
  seriesNames?: string[]
}

export interface PointMarkOptions {
  seriesBindable?: boolean[]
  seriesVisibility?: boolean[]
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
  closeSeriesPicker: () => void
}

export const usePointMarkStore = create<PointMarkState & PointMarkActions>(
  (set, get) => ({
    clicksByChart: {},
    markedXValues: null,
    markedYValue: null,
    chartDataForModal: null,
    chartIdForModal: null,
    bindableIndices: [],
    seriesPickerOpen: false,
    pointMarkersByChart: {},
    iconsByChart: {},

    addPointMark: (chartId, xValue, yValue, chartData, options) => {
      const { clicksByChart, addIcon } = get()
      const clicks = [...(clicksByChart[chartId] ?? []), { x: xValue, y: yValue }]
      const index = clicks.length - 1
      const seriesCount = chartData.ys?.length ?? 0

      const seriesBindable = options?.seriesBindable
      const seriesVisibility = options?.seriesVisibility ?? Array.from({ length: seriesCount }, () => true)

      const bindableIndices =
        seriesBindable != null
          ? Array.from({ length: seriesCount }, (_, i) => i).filter((i) => seriesBindable[i] !== false)
          : Array.from({ length: seriesCount }, (_, i) => i)

      if (clicks.length === 3) {
        const middleX = clicks[1].x
        let openModal = false
        let autoBindIndex: number | null = null

        if (bindableIndices.length === 0) {
          openModal = false
        } else if (bindableIndices.length === 1) {
          autoBindIndex = bindableIndices[0]!
        } else {
          const visibleBindable = bindableIndices.filter((i) => seriesVisibility[i])
          if (visibleBindable.length === 1) {
            autoBindIndex = visibleBindable[0]!
          } else {
            openModal = true
          }
        }

        if (autoBindIndex != null) {
          const point = getInterpolatedPointAtX(chartData, middleX, autoBindIndex)
          if (point) {
            addIcon(chartId, {
              iconImage: DEFAULT_POINT_MARK_ICON_SVG,
              location: { x: point.x, y: point.y },
              color: '#888888',
            })
          }
        }

        set({
          clicksByChart: { ...clicksByChart, [chartId]: [] },
          markedXValues: [clicks[0].x, clicks[1].x, clicks[2].x],
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

    closeSeriesPicker: () =>
      set({
        markedXValues: null,
        markedYValue: null,
        chartDataForModal: null,
        chartIdForModal: null,
        bindableIndices: [],
        seriesPickerOpen: false,
      }),
  })
)
