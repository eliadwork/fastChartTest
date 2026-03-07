import { useMemo } from 'react'
import type { ChartOptions } from '../types'
import type {
  ChartImplementationOptions,
  ChartImplementationOptionsOverrides,
} from '../implementation/implementationProps'
import type { ChartOptionsInput } from '../chartTypes'
import {
  CHART_RESAMPLING_PRECISION_DEFAULT,
  CHART_RESAMPLING_PRECISION_OFF,
} from '../chartConstants'

export interface UseChartWrapperOptionsParams {
  options: ChartOptionsInput
  icons?: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>
  seriesVisibility: boolean[]
  handleSeriesVisibilityChange: (index: number, visible: boolean) => void
  handleSeriesVisibilityGroupChange: (indices: number[], visible: boolean) => void
  handleDisableAll: () => void
}

export const useChartWrapperOptions = ({
  options,
  icons,
  seriesVisibility,
  handleSeriesVisibilityChange,
  handleSeriesVisibilityGroupChange,
  handleDisableAll,
}: UseChartWrapperOptionsParams): ChartImplementationOptionsOverrides => {
  return useMemo(() => {
    const opts = options
    const isResamplingObject =
      opts.resampling != null && opts.resampling !== true && opts.resampling !== false
    const resamplingObj: ChartImplementationOptions['resampling'] = isResamplingObject
      ? (opts.resampling as ChartImplementationOptions['resampling'])
      : {
            enable: opts.resampling !== false,
            precision:
              (opts as ChartOptions).resamplingPrecision ??
              (opts.resampling ? CHART_RESAMPLING_PRECISION_DEFAULT : CHART_RESAMPLING_PRECISION_OFF),
          }
    return {
      shapes: opts.shapes,
      icons: icons ?? opts.icons,
      note: opts.note,
      stretch: opts.stretch ?? {
        enable: true,
        trigger: ((opts as ChartOptions).stretchTrigger ?? 'rightClick') as ChartImplementationOptions['stretch']['trigger'],
      },
      pan: opts.pan ?? {
        enable: true,
        trigger: ((opts as ChartOptions).panTrigger ?? (opts as ChartOptions).panKey ?? 'shift') as ChartImplementationOptions['pan']['trigger'],
      },
      resampling: resamplingObj,
      clipZoomToData: opts.clipZoomToData !== false,
      seriesVisibility,
      seriesGroupKeys: opts.seriesGroupKeys,
      onSeriesVisibilityChange: handleSeriesVisibilityChange,
      onSeriesVisibilityGroupChange: handleSeriesVisibilityGroupChange,
      onDisableAll: handleDisableAll,
      events: opts.events ?? { onmiddleclick: (opts as ChartOptions).onPointMark },
    }
  }, [
    options,
    icons,
    seriesVisibility,
    handleSeriesVisibilityChange,
    handleSeriesVisibilityGroupChange,
    handleDisableAll,
  ])
}
