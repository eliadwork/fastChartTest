import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

import { CHART_TOOLBAR_GAP } from './chartConstants'

export const ChartToolbar = styled(Box)({
  display: 'flex',
  gap: CHART_TOOLBAR_GAP,
  alignSelf: 'center',
  flexShrink: 0,
})
