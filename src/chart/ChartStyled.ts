import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { CHART_TOOLBAR_GAP } from './chartConstants';

export const ChartToolbar = styled(Box)({
  display: 'flex',
  gap: CHART_TOOLBAR_GAP,
  alignSelf: 'center',
  flexShrink: 0,
});

export const ChartHeaderContent = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 0.5,
  flex: 1,
  minWidth: 0,
});

export const ChartHeaderTextContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});
