/**
 * SciChart-specific types.
 * Implementation receives ChartImplementationProps and converts internally.
 */

import type { ChartImplementationProps } from '../implementationProps'

/** Re-export for consumers. SciChart uses the same props as all implementations. */
export type SciChartWrapperProps = ChartImplementationProps
