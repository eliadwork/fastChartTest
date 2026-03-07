/**
 * Generic chart wrapper interface.
 * Defines the contract for chart implementation wrappers (e.g. SciChartWrapper).
 */

import type { ChartData } from './types'

export interface ChartWrapperDataProps {
  data: ChartData
}

export interface ChartWrapperSlotProps {
  /** Optional overlay slot (e.g. legend) – rendered inside the chart surface. Parent provides this. */
  overlaySlot?: React.ReactNode
}

export interface ChartWrapperLoadingProps {
  /** When true, show loader instead of chart. */
  loading?: boolean
}

/** Base props shared by all chart wrapper implementations. */
export type ChartWrapperBaseProps = ChartWrapperDataProps &
  ChartWrapperSlotProps &
  ChartWrapperLoadingProps & {
    chartId?: string
  }
