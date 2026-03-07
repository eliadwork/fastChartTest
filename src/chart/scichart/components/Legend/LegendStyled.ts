import { styled } from '@mui/material/styles'

import {
  LEGEND_MAX_HEIGHT,
  LEGEND_OPACITY_VISIBLE,
  LEGEND_TEXT_DECORATION_VISIBLE,
} from './legendConstants'

export const LegendRoot = styled('div')(({ theme }) => {
  const legend = theme.chartLegend
  return {
    position: 'absolute',
    top: theme.spacing(legend.inset),
    left: theme.spacing(legend.inset),
    zIndex: legend.zIndex,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(legend.gap),
    padding: theme.spacing(legend.paddingBlock, legend.padding),
    borderRadius: theme.spacing(legend.borderRadius),
    maxHeight: LEGEND_MAX_HEIGHT,
    overflowY: 'auto',
    fontSize: `${legend.fontSize}rem`,
    pointerEvents: 'auto',
  }
})

export const LegendItemButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(theme.chartLegend.gap),
  padding: theme.spacing(theme.chartLegend.itemPaddingBlock, 0),
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
  gap: theme.spacing(theme.chartLegend.groupGap),
}))

export const LegendLineSvg = styled('svg')({
  flexShrink: 0,
})
