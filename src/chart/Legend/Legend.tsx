import type { ReactNode } from 'react'
import type { SeriesInfo } from './useLegend'
import { useLegend } from './useLegend'
import {
  LegendRoot,
  LegendItemButton,
  LegendItemLabel,
  LegendGroup,
  LegendLineSvg,
} from './LegendStyled'
import {
  LEGEND_DEFAULT_BACKGROUND,
  LEGEND_DEFAULT_TEXT_COLOR,
  LEGEND_LINE_HEIGHT,
  LEGEND_LINE_VIEWBOX,
  LEGEND_LINE_WIDTH,
  LEGEND_LINE_X1,
  LEGEND_LINE_X2,
  LEGEND_LINE_Y1,
  LEGEND_LINE_Y2,
  LEGEND_OPACITY_HIDDEN,
  LEGEND_OPACITY_VISIBLE,
  LEGEND_TEXT_DECORATION_HIDDEN,
  LEGEND_TEXT_DECORATION_VISIBLE,
  LEGEND_ITEM_INDENT,
  STROKE_DASHARRAY_NONE,
} from './legendConstants'

export interface LegendProps {
  backgroundColor?: string
  textColor?: string
  /** When provided, triggers re-render after SeriesVisibilitySync (e.g. "disable all") updates the chart. */
  seriesVisibility?: boolean[]
  /** Group key per series (parallel to series). Same key = grouped together, toggle on/off as one. */
  seriesGroupKeys?: (string | undefined)[]
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
  /** Optional content to render at the top of the legend (e.g. Disable all button). */
  prepend?: ReactNode
}

const LegendLine = ({
  stroke,
  strokeThickness,
  strokeDashArray,
}: {
  stroke: string
  strokeThickness: number
  strokeDashArray?: number[]
}) => (
  <LegendLineSvg width={LEGEND_LINE_WIDTH} height={LEGEND_LINE_HEIGHT} viewBox={LEGEND_LINE_VIEWBOX}>
    <line
      x1={LEGEND_LINE_X1}
      y1={LEGEND_LINE_Y1}
      x2={LEGEND_LINE_X2}
      y2={LEGEND_LINE_Y2}
      stroke={stroke}
      strokeWidth={strokeThickness}
      strokeDasharray={strokeDashArray?.join(' ') ?? STROKE_DASHARRAY_NONE}
    />
  </LegendLineSvg>
)

const LegendSeriesItem = ({
  series,
  onClick,
  indent,
}: {
  series: SeriesInfo
  onClick: () => void
  indent?: boolean
}) => (
  <LegendItemButton
    type="button"
    onClick={onClick}
    sx={{
      pl: indent ? LEGEND_ITEM_INDENT : 0,
      opacity: series.isVisible ? LEGEND_OPACITY_VISIBLE : LEGEND_OPACITY_HIDDEN,
      textDecoration: series.isVisible ? LEGEND_TEXT_DECORATION_VISIBLE : LEGEND_TEXT_DECORATION_HIDDEN,
    }}
  >
    <LegendLine
      stroke={series.stroke}
      strokeThickness={series.strokeThickness}
      strokeDashArray={series.strokeDashArray}
    />
    <LegendItemLabel>{series.name}</LegendItemLabel>
  </LegendItemButton>
)

export const Legend = ({
  backgroundColor,
  textColor,
  seriesVisibility,
  seriesGroupKeys,
  onSeriesVisibilityChange,
  onSeriesVisibilityGroupChange,
  prepend,
}: LegendProps) => {
  const { seriesList, groups, ungrouped, handleClick, handleGroupClick } = useLegend({
    seriesVisibility,
    seriesGroupKeys,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  })

  if (seriesList.length === 0) return null

  return (
    <LegendRoot
      sx={{
        backgroundColor: backgroundColor ?? LEGEND_DEFAULT_BACKGROUND,
        color: textColor ?? LEGEND_DEFAULT_TEXT_COLOR,
      }}
    >
      {prepend}
      {groups.map((group) => {
        const items = group.seriesIndices
          .map((index) => seriesList[index])
          .filter(Boolean)
        if (items.length === 0) return null
        const allVisible = items.every((item) => item.isVisible)
        const first = items[0]!
        return (
          <LegendGroup key={group.name}>
            <LegendItemButton
              type="button"
              onClick={() => handleGroupClick(group.seriesIndices)}
              sx={{
                opacity: allVisible ? LEGEND_OPACITY_VISIBLE : LEGEND_OPACITY_HIDDEN,
                textDecoration: allVisible ? LEGEND_TEXT_DECORATION_VISIBLE : LEGEND_TEXT_DECORATION_HIDDEN,
              }}
            >
              <LegendLine
                stroke={first.stroke}
                strokeThickness={first.strokeThickness}
                strokeDashArray={first.strokeDashArray}
              />
              <LegendItemLabel>{group.name}</LegendItemLabel>
            </LegendItemButton>
            {items.map((series) => (
              <LegendSeriesItem
                key={series.index}
                series={series}
                onClick={() => handleClick(series.index)}
                indent
              />
            ))}
          </LegendGroup>
        )
      })}
      {ungrouped.map((series) => (
        <LegendSeriesItem key={series.index} series={series} onClick={() => handleClick(series.index)} />
      ))}
    </LegendRoot>
  )
}
