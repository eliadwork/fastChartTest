import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';

import {
  LEGEND_TREE_BORDER_RADIUS,
  LEGEND_TREE_FONT_SIZE,
  LEGEND_TREE_GAP,
  LEGEND_TREE_INSET,
  LEGEND_TREE_MAX_HEIGHT,
  LEGEND_TREE_PADDING,
  LEGEND_TREE_PADDING_BLOCK,
  LEGEND_TREE_ROW_PADDING_BLOCK,
  LEGEND_TREE_Z_INDEX,
} from './legendTreeConstants';

export const LegendTreeRoot = styled('div')<{
  $zIndex?: number;
}>(({ theme, $zIndex }) => ({
  position: 'absolute',
  top: theme.spacing(LEGEND_TREE_INSET),
  left: theme.spacing(LEGEND_TREE_INSET),
  zIndex: $zIndex ?? LEGEND_TREE_Z_INDEX,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(LEGEND_TREE_GAP),
  padding: theme.spacing(LEGEND_TREE_PADDING_BLOCK, LEGEND_TREE_PADDING),
  borderRadius: theme.spacing(LEGEND_TREE_BORDER_RADIUS),
  maxHeight: LEGEND_TREE_MAX_HEIGHT,
  overflowY: 'auto',
  fontSize: `${LEGEND_TREE_FONT_SIZE}rem`,
  pointerEvents: 'auto',
}));

export const LegendTreeChildren = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
});

export const LegendTreeRowButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(LEGEND_TREE_GAP),
  padding: theme.spacing(LEGEND_TREE_ROW_PADDING_BLOCK, 0),
  border: 'none',
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
}));

export const LegendTreeItemLabel = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const LegendTreeItemState = styled('span')(({ theme }) => ({
  marginLeft: 'auto',
  fontSize: theme.typography.pxToRem(11),
  fontWeight: 600,
  opacity: 0.95,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
}));

export const LegendTreeItemSymbol = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const LegendTreeToggleCheckbox = styled(Checkbox)({
  padding: 0,
});

export const LegendTreeIndent = styled('span')<{
  $depth: number;
  $indentSize: string;
}>(({ $depth, $indentSize }) => ({
  display: 'inline-block',
  width: `calc(${$depth} * ${$indentSize})`,
  flexShrink: 0,
}));
