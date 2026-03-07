import type { ChartIcon, ChartOptions } from '../../types'
import type { ConvertedData, ConvertedSeries } from './convert'
import { SciChartReact } from 'scichart-react'
import { SkeletonLoading } from '../../../shared'
import { DEFAULT_LEGEND_BACKGROUND_COLOR } from '../../defaults'
import { Legend } from '../../Legend'
import { usePointMarkersSync } from './hooks/usePointMarkersSync'
import { useSciChartSurfaceRenderer } from './hooks/useSciChartSurfaceRenderer'
import { useSeriesVisibilitySync } from './hooks/useSeriesVisibilitySync'
import { useZoomResetSync } from './hooks/useZoomResetSync'
import {
  SCI_CHART_DEFAULT_TEXT_COLOR,
  SCI_CHART_POINT_MARK_ICON_SIZE_DEFAULT,
} from './sciChartWrapperConstants'
import { SciChartContainer, SciChartSurfaceStyle } from './SciChartWrapperStyled'

/** Renders inside SciChartReact to provide context for sync hooks. */
const SciChartSyncHooks = ({
  chartId,
  icons,
  defaultIcon,
  defaultColor,
  iconSize,
  seriesVisibility,
}: {
  chartId?: string
  icons: ChartIcon[]
  defaultIcon: string
  defaultColor: string
  iconSize: number
  seriesVisibility?: boolean[]
}) => {
  useZoomResetSync(chartId)
  usePointMarkersSync({ icons, defaultIcon, defaultColor, iconSize })
  useSeriesVisibilitySync(seriesVisibility)
  return null
}

export interface SciChartSurfaceRendererProps {
  data: ConvertedData
  options: ChartOptions
  chartId?: string
  overlaySlot?: React.ReactNode
}

export const SciChartSurfaceRenderer = ({
  data,
  options,
  chartId,
  overlaySlot,
}: SciChartSurfaceRendererProps) => {
  const { initChart, pointMarkIcon, pointMarkIconColor } = useSciChartSurfaceRenderer({
    data,
    options,
    chartId,
  })

  return (
    <SciChartContainer>
      <SciChartReact
        style={SciChartSurfaceStyle}
        fallback={<SkeletonLoading />}
        initChart={initChart}
      >
        <SciChartSyncHooks
          chartId={chartId}
          icons={options.icons ?? []}
          defaultIcon={pointMarkIcon}
          defaultColor={pointMarkIconColor}
          iconSize={options.pointMarkIconSize ?? SCI_CHART_POINT_MARK_ICON_SIZE_DEFAULT}
          seriesVisibility={options.seriesVisibility}
        />
        {!options.chartOnly &&
          (overlaySlot ?? (
            <Legend
              backgroundColor={
                options.legendBackgroundColor ?? options.backgroundColor ?? DEFAULT_LEGEND_BACKGROUND_COLOR
              }
              textColor={options.textColor ?? SCI_CHART_DEFAULT_TEXT_COLOR}
              seriesVisibility={options.seriesVisibility}
              seriesGroupKeys={data.series.map((series: ConvertedSeries) => series.lineGroupKey)}
              onSeriesVisibilityChange={options.onSeriesVisibilityChange}
              onSeriesVisibilityGroupChange={options.onSeriesVisibilityGroupChange}
            />
          ))}
      </SciChartReact>
    </SciChartContainer>
  )
}
