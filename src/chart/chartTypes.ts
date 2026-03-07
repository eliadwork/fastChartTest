import type { ChartOptions } from './types'
import type {
  ChartImplementationOptions,
  ChartImplementationOptionsOverrides,
} from './implementation/implementationProps'

/** Accepts ChartOptions (legacy flat) or ChartImplementationOptionsOverrides (nested). */
export type ChartOptionsInput = Omit<ChartOptions, 'resampling'> &
  Omit<ChartImplementationOptionsOverrides, 'resampling'> & {
    resampling?: boolean | ChartImplementationOptions['resampling']
  }
