import { useLegend } from './useLegend';
import { LegendTree } from '../../shared/legend';
import type { LegendTreeNode } from '../../shared/legend';
import { LegendLineSvg } from './LegendStyled';
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
  LEGEND_ITEM_INDENT,
  STROKE_DASHARRAY_NONE,
} from './legendConstants';

export interface LegendProps {
  backgroundColor?: string;
  textColor?: string;
  /** When provided, triggers re-render after SeriesVisibilitySync (e.g. "disable all") updates the chart. */
  seriesVisibility?: boolean[];
  /** Group key per series (parallel to series). Same key = grouped together, toggle on/off as one. */
  seriesGroupKeys?: (string | undefined)[];
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void;
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void;
}

export interface LegendLineProps {
  stroke: string;
  strokeThickness: number;
  strokeDashArray?: number[];
}

const LegendLine = ({ stroke, strokeThickness, strokeDashArray }: LegendLineProps) => (
  <LegendLineSvg
    width={LEGEND_LINE_WIDTH}
    height={LEGEND_LINE_HEIGHT}
    viewBox={LEGEND_LINE_VIEWBOX}
  >
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
);

export const Legend = ({
  backgroundColor,
  textColor,
  seriesVisibility,
  seriesGroupKeys,
  onSeriesVisibilityChange,
  onSeriesVisibilityGroupChange,
}: LegendProps) => {
  const { seriesList, groups, ungrouped, handleClick, handleGroupClick } = useLegend({
    seriesVisibility,
    seriesGroupKeys,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  });

  if (seriesList.length === 0) return null;

  const groupedNodes: LegendTreeNode[] = groups.reduce<LegendTreeNode[]>(
    (accumulatedNodes, group, groupIndex) => {
      const items = group.seriesIndices.map((index) => seriesList[index]).filter(Boolean);
      if (items.length === 0) {
        return accumulatedNodes;
      }

      const visibleCount = items.filter((series) => series.isVisible).length;
      const allVisible = visibleCount === items.length;
      const anyVisible = visibleCount > 0;
      const firstItem = items[0]!;

      accumulatedNodes.push({
        id: `group-${group.name}-${groupIndex}`,
        label: group.name,
        checked: allVisible,
        indeterminate: anyVisible && !allVisible,
        symbol: (
          <LegendLine
            stroke={firstItem.stroke}
            strokeThickness={firstItem.strokeThickness}
            strokeDashArray={firstItem.strokeDashArray}
          />
        ),
        children: items.map((series) => ({
          id: `series-${series.index}`,
          label: series.name,
          checked: series.isVisible,
          indeterminate: false,
          symbol: (
            <LegendLine
              stroke={series.stroke}
              strokeThickness={series.strokeThickness}
              strokeDashArray={series.strokeDashArray}
            />
          ),
        })),
      } satisfies LegendTreeNode);

      return accumulatedNodes;
    },
    []
  );

  const ungroupedNodes: LegendTreeNode[] = ungrouped.map((series) => ({
    id: `series-${series.index}`,
    label: series.name,
    checked: series.isVisible,
    indeterminate: false,
    symbol: (
      <LegendLine
        stroke={series.stroke}
        strokeThickness={series.strokeThickness}
        strokeDashArray={series.strokeDashArray}
      />
    ),
  }));

  const legendNodes = [...groupedNodes, ...ungroupedNodes];

  return (
    <LegendTree
      nodes={legendNodes}
      onToggle={(nodeId) => {
        if (nodeId.startsWith('series-')) {
          const seriesIndex = Number(nodeId.slice('series-'.length));
          if (!Number.isNaN(seriesIndex)) {
            handleClick(seriesIndex);
          }
          return;
        }

        if (!nodeId.startsWith('group-')) {
          return;
        }

        const groupNode = groupedNodes.find((node) => node.id === nodeId);
        if (!groupNode || !groupNode.children) {
          return;
        }

        const seriesIndices = groupNode.children
          .map((node) => Number(node.id.slice('series-'.length)))
          .filter((index) => !Number.isNaN(index));
        handleGroupClick(seriesIndices);
      }}
      backgroundColor={backgroundColor ?? LEGEND_DEFAULT_BACKGROUND}
      textColor={textColor ?? LEGEND_DEFAULT_TEXT_COLOR}
      withCheckbox={false}
      indentSize={LEGEND_ITEM_INDENT}
    />
  );
};
