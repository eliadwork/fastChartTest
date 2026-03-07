import type { ChartOptions } from './types'
import type { ChartImplementationOptionsOverrides } from './implementation/implementationProps'

/** Accepts ChartOptions or ChartImplementationOptionsOverrides. */
export type ChartOptionsInput = ChartOptions & ChartImplementationOptionsOverrides
