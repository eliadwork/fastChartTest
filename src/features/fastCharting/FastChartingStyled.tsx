import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import {
  FAST_CHARTING_COLLAPSED_WIDTH,
  FAST_CHARTING_EXPANDED_WIDTH_PERCENT,
  FAST_CHARTING_RESIZE_HANDLE_SIZE,
} from './fastChartingConstants';

export const FastChartingPane = styled('div')<{ $expanded: boolean }>(
  ({ theme, $expanded }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: $expanded ? `${FAST_CHARTING_EXPANDED_WIDTH_PERCENT}%` : FAST_CHARTING_COLLAPSED_WIDTH,
    minWidth: $expanded ? undefined : FAST_CHARTING_COLLAPSED_WIDTH,
    flexShrink: 0,
    borderLeft: '1px solid',
    borderColor: theme.palette.divider,
    transition: 'width 0.2s ease',
    overflow: 'hidden',
    minHeight: 0,
  })
);

export const FastChartingPaneChartSlot = styled('div')({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const FastChartingPaneCollapsedSlot = styled('div')({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const FastChartingToggleButton = styled(Button)(({ theme }) => ({
  minWidth: FAST_CHARTING_COLLAPSED_WIDTH,
  padding: theme.spacing(1),
  borderRadius: 0,
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
}));

export const FastChartingRoot = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  minHeight: 0,
}));

export const FastChartingChartWrapper = styled('div')({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const FastChartingResizeHandle = styled('div')(({ theme }) => ({
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: FAST_CHARTING_RESIZE_HANDLE_SIZE,
  height: FAST_CHARTING_RESIZE_HANDLE_SIZE,
  cursor: 'nwse-resize',
  zIndex: theme.zIndex.tooltip,
  '&::after': {
    content: '""',
    position: 'absolute',
    right: theme.spacing(0.5),
    bottom: theme.spacing(0.5),
    width: 6,
    height: 6,
    borderRight: `2px solid ${theme.palette.text.disabled}`,
    borderBottom: `2px solid ${theme.palette.text.disabled}`,
  },
  '&:hover::after': {
    borderColor: theme.palette.text.secondary,
  },
}));
