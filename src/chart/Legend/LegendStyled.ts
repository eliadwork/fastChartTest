import { styled } from '@mui/material/styles'

import {
  LEGEND_BORDER_RADIUS,
  LEGEND_FONT_SIZE,
  LEGEND_GAP,
  LEGEND_GROUP_GAP,
  LEGEND_INSET,
  LEGEND_ITEM_PADDING_BLOCK,
  LEGEND_MAX_HEIGHT,
  LEGEND_OPACITY_VISIBLE,
  LEGEND_PADDING,
  LEGEND_PADDING_BLOCK,
  LEGEND_TEXT_DECORATION_VISIBLE,
  LEGEND_Z_INDEX,
} from './legendConstants'

export const LegendRoot = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(LEGEND_INSET),
  left: theme.spacing(LEGEND_INSET),
  zIndex: LEGEND_Z_INDEX,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(LEGEND_GAP),
  padding: theme.spacing(LEGEND_PADDING_BLOCK, LEGEND_PADDING),
  borderRadius: theme.spacing(LEGEND_BORDER_RADIUS),
  maxHeight: LEGEND_MAX_HEIGHT,
  overflowY: 'auto',
  fontSize: `${LEGEND_FONT_SIZE}rem`,
  pointerEvents: 'auto',
}))

export const LegendItemButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(LEGEND_GAP),
  padding: theme.spacing(LEGEND_ITEM_PADDING_BLOCK, 0),
  border: 'none',
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
  '&:hover': { opacity: LEGEND_OPACITY_VISIBLE, textDecoration: LEGEND_TEXT_DECORATION_VISIBLE },
}))

export const LegendItemLabel = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const LegendGroup = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(LEGEND_GROUP_GAP),
}))

export const LegendLineSvg = styled('svg')({
  flexShrink: 0,
})
