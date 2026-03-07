import { styled } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export const SciChartLoadingBox = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 0,
})

export const SciChartLoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.text.secondary,
}))

export const SciChartContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: 0,
})

export const SciChartSurfaceStyle = {
  width: '100%',
  height: '100%',
  flex: 1,
  minHeight: 0,
} as const
