import { DEFAULT_POINT_MARK_ICON_SVG } from '../../../assets/pointMarkIcon'
import type { ChartZoomCallbacks } from '../implementationProps'
import type { ConvertedData } from './convert'
import type { SciChartMergedOptions } from './hooks/useSciChartMergedOptions'
import type { UseSciChartSyncHooksParams } from './hooks/useSciChartSyncHooks'
import { SciChartReact } from 'scichart-react'
import { SkeletonLoading } from '../../../shared'
import { useSciChartSurfaceRenderer } from './hooks/useSciChartSurfaceRenderer'
import { useSciChartSyncHooks } from './hooks/useSciChartSyncHooks'
import { SciChartContainer, SciChartSurfaceStyle } from './SciChartWrapperStyled'

const DEFAULT_ICON_COLOR = '#3388ff'

/** Must render inside SciChartReact so useSciChartSyncHooks has context. */
const SciChartSyncEffects = (params: UseSciChartSyncHooksParams) => {
  useSciChartSyncHooks(params)
  return null
}

export interface SciChartSurfaceRendererProps {
  data: ConvertedData
  options: SciChartMergedOptions
  zoomCallbacks?: ChartZoomCallbacks
  overlaySlot?: React.ReactNode
}

export const SciChartSurfaceRenderer = ({
  data,
  options,
  zoomCallbacks,
  overlaySlot,
}: SciChartSurfaceRendererProps) => {
  const { initChart, lineShapes, boxes } = useSciChartSurfaceRenderer({
    data,
    options,
    zoomCallbacks,
  })

  return (
    <SciChartContainer>
      <SciChartReact
        style={SciChartSurfaceStyle}
        fallback={<SkeletonLoading />}
        initChart={initChart}
      >
        <SciChartSyncEffects
          zoomCallbacks={zoomCallbacks}
          icons={options.icons ?? []}
          defaultIcon={DEFAULT_POINT_MARK_ICON_SVG}
          defaultColor={DEFAULT_ICON_COLOR}
          iconSize={1}
          seriesVisibility={options.seriesVisibility}
          lineShapes={lineShapes}
          boxes={boxes}
          data={data}
        />
        {!options.chartOnly && overlaySlot}
      </SciChartReact>
    </SciChartContainer>
  )
}
