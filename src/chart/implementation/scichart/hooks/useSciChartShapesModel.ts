import type { SciChartMergedOptions } from './useSciChartMergedOptions'

import { useMemo } from 'react'

import { convertShapes } from '../convert'

export const useSciChartShapesModel = (shapes: SciChartMergedOptions['shapes']) => {
  return useMemo(() => convertShapes(shapes), [shapes])
}
