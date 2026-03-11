import type { ReactNode } from 'react';

import {
  LEGEND_TREE_DECORATION_HIDDEN,
  LEGEND_TREE_DECORATION_VISIBLE,
  LEGEND_TREE_DEFAULT_BACKGROUND,
  LEGEND_TREE_DEFAULT_TEXT_COLOR,
  LEGEND_TREE_INDENT,
  LEGEND_TREE_OPACITY_HIDDEN,
  LEGEND_TREE_OPACITY_PARTIAL,
  LEGEND_TREE_OPACITY_VISIBLE,
} from './legendTreeConstants';
import {
  LegendTreeChildren,
  LegendTreeIndent,
  LegendTreeItemLabel,
  LegendTreeItemState,
  LegendTreeItemSymbol,
  LegendTreeRoot,
  LegendTreeRowButton,
  LegendTreeToggleCheckbox,
} from './LegendTreeStyled';

export interface LegendTreeNode {
  id: string;
  label: string;
  stateLabel?: string;
  checked: boolean;
  indeterminate?: boolean;
  symbol?: ReactNode;
  children?: LegendTreeNode[];
}

export interface LegendTreeProps {
  nodes: LegendTreeNode[];
  onToggle: (nodeId: string, nextChecked: boolean) => void;
  backgroundColor?: string;
  textColor?: string;
  withCheckbox?: boolean;
  indentSize?: string;
  zIndex?: number;
}

const resolveNextChecked = ({
  checked,
  indeterminate,
}: {
  checked: boolean;
  indeterminate: boolean;
}) => {
  if (indeterminate) {
    return false;
  }

  return !checked;
};

const LegendTreeRows = ({
  nodes,
  depth,
  onToggle,
  withCheckbox,
  indentSize,
}: {
  nodes: LegendTreeNode[];
  depth: number;
  onToggle: (nodeId: string, nextChecked: boolean) => void;
  withCheckbox: boolean;
  indentSize: string;
}) => (
  <LegendTreeChildren>
    {nodes.map((node) => {
      const indeterminate = node.indeterminate === true;
      const opacity = indeterminate
        ? LEGEND_TREE_OPACITY_PARTIAL
        : node.checked
          ? LEGEND_TREE_OPACITY_VISIBLE
          : LEGEND_TREE_OPACITY_HIDDEN;
      const textDecoration = node.checked || indeterminate
        ? LEGEND_TREE_DECORATION_VISIBLE
        : LEGEND_TREE_DECORATION_HIDDEN;
      const nextChecked = resolveNextChecked({ checked: node.checked, indeterminate });

      return (
        <LegendTreeChildren key={node.id}>
          <LegendTreeRowButton
            type="button"
            onClick={() => onToggle(node.id, nextChecked)}
            sx={{ opacity, textDecoration }}
          >
            <LegendTreeIndent $depth={depth} $indentSize={indentSize} />
            {withCheckbox ? (
              <LegendTreeToggleCheckbox
                size="small"
                checked={node.checked}
                indeterminate={indeterminate}
                onClick={(reactEvent) => reactEvent.stopPropagation()}
                onChange={() => onToggle(node.id, nextChecked)}
              />
            ) : null}
            {node.symbol ? <LegendTreeItemSymbol>{node.symbol}</LegendTreeItemSymbol> : null}
            <LegendTreeItemLabel>{node.label}</LegendTreeItemLabel>
            {node.stateLabel ? <LegendTreeItemState>{node.stateLabel}</LegendTreeItemState> : null}
          </LegendTreeRowButton>
          {node.children && node.children.length > 0 ? (
            <LegendTreeRows
              nodes={node.children}
              depth={depth + 1}
              onToggle={onToggle}
              withCheckbox={withCheckbox}
              indentSize={indentSize}
            />
          ) : null}
        </LegendTreeChildren>
      );
    })}
  </LegendTreeChildren>
);

export const LegendTree = ({
  nodes,
  onToggle,
  backgroundColor,
  textColor,
  withCheckbox = false,
  indentSize = LEGEND_TREE_INDENT,
  zIndex,
}: LegendTreeProps) => {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <LegendTreeRoot
      $zIndex={zIndex}
      sx={{
        backgroundColor: backgroundColor ?? LEGEND_TREE_DEFAULT_BACKGROUND,
        color: textColor ?? LEGEND_TREE_DEFAULT_TEXT_COLOR,
      }}
    >
      <LegendTreeRows
        nodes={nodes}
        depth={0}
        onToggle={onToggle}
        withCheckbox={withCheckbox}
        indentSize={indentSize}
      />
    </LegendTreeRoot>
  );
};
