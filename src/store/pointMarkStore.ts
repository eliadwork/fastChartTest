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

interface PointMarkState {
  clicksByChart: Record<string, number[]>
  markedXValues: [number, number, number] | null
  chartDataForModal: ChartDataForModal | null
  seriesPickerOpen: boolean
}

interface PointMarkActions {
  addPointMark: (
    chartId: string,
    xValue: number,
    chartData: ChartDataForModal
  ) => ChartShapeForMark | null  // Compatible with GenericChartShape (axis, value)
  closeSeriesPicker: () => void
}

export const usePointMarkStore = create<PointMarkState & PointMarkActions>(
  (set, get) => ({
    clicksByChart: {},
    markedXValues: null,
    chartDataForModal: null,
    seriesPickerOpen: false,

    addPointMark: (chartId, xValue, chartData) => {
      const { clicksByChart } = get()
      const clicks = [...(clicksByChart[chartId] ?? []), xValue]
      const index = clicks.length - 1

      if (clicks.length === 3) {
        set({
          clicksByChart: { ...clicksByChart, [chartId]: [] },
          markedXValues: clicks as [number, number, number],
          chartDataForModal: chartData,
          seriesPickerOpen: true,
        })
      } else {
        set({
          clicksByChart: { ...clicksByChart, [chartId]: clicks },
        })
      }

      return createShapeForIndex(index, xValue)
    },

    closeSeriesPicker: () =>
      set({
        markedXValues: null,
        chartDataForModal: null,
        seriesPickerOpen: false,
      }),
  })
)
