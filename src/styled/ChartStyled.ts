import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'

export const ChartComparison = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  padding: '0.5rem',
  boxSizing: 'border-box',
})

export const ChartComparisonGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.5rem',
  flex: 1,
  minHeight: 0,
})

export const ChartPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: '0.5rem',
  overflow: 'hidden',
  minHeight: 0,
}))

export const ChartPanelHeader = styled(Box)({
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  gap: '0.5rem',
  margin: 0,
  padding: '0.5rem 1rem',
  backgroundColor: '#1a1a1a',
  flexShrink: 0,
})

export const ChartPanelHeaderText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
})

export const ChartPanelTitle = styled(Typography)({
  margin: 0,
  fontSize: '0.9rem',
})

export const ChartPanelNote = styled(Typography)({
  margin: '0.15rem 0 0',
  fontSize: '0.75rem',
  lineHeight: 1.3,
  opacity: 0.9,
})

export const ChartToolbarButton = styled(Button)({
  padding: '0.4rem 0.8rem',
  fontSize: '0.85rem',
  textTransform: 'none',
})

export const ChartWrapperBox = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
})

export const PointMarkModalOverlay = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: '0.5rem',
    padding: '1.5rem',
    maxWidth: '90vw',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
}))

export const PointMarkModalTitle = styled(Typography)({
  margin: '0 0 1rem',
  fontSize: '1rem',
})

export const PointMarkModalButtons = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginBottom: '1rem',
})

export const PointMarkModalButton = styled(Button)({
  textTransform: 'none',
})

export const PointMarkModalCancel = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.text.primary,
  },
}))
