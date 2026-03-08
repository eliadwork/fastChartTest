import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';

export const ChartComparison = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100vh',
  padding: '0.5rem',
  boxSizing: 'border-box',
});

export const ChartComparisonGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.5rem',
  flex: 1,
  minHeight: 0,
});

export const ChartPanel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: '0.5rem',
  overflow: 'hidden',
  minHeight: 0,
}));

export const ChartPanelHeader = styled(Box)({
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'space-between',
  gap: '0.5rem',
  margin: 0,
  padding: '0.5rem 1rem',
  backgroundColor: '#1a1a1a',
  flexShrink: 0,
});

export const ChartPanelHeaderText = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  overflowWrap: 'break-word',
  wordBreak: 'break-word',
});

export const ChartPanelTitle = styled(Typography)({
  margin: 0,
  fontSize: '0.9rem',
});

export const ChartPanelNote = styled(Typography)({
  margin: '0.15rem 0 0',
  fontSize: '0.75rem',
  lineHeight: 1.3,
  opacity: 0.9,
});

export const ChartToolbarButtonBase = styled(Button)({
  padding: '0.4rem 0.8rem',
  fontSize: '0.85rem',
  textTransform: 'none',
  '& .MuiSvgIcon-root': {
    fontSize: '1.1rem',
  },
});

export const ChartWrapperBox = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const PointMarkModalOverlay = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: 20,
    padding: 0,
    maxWidth: '90vw',
    boxShadow:
      '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(2px)',
  },
}));

export const PointMarkModalTitle = styled(Typography)(({ theme }) => ({
  margin: 0,
  marginBottom: theme.spacing(2),
  fontSize: theme.typography.pxToRem(18),
  fontWeight: 600,
  letterSpacing: '-0.01em',
  lineHeight: 1.35,
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

export const PointMarkModalSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  '&:last-of-type': {
    marginBottom: 0,
  },
}));

export const PointMarkModalSectionLabel = styled('span')(({ theme }) => ({
  display: 'block',
  fontSize: theme.typography.pxToRem(13),
  fontWeight: 500,
  color: theme.palette.text.secondary,
  letterSpacing: '0.02em',
  marginBottom: theme.spacing(1),
  textAlign: 'center',
}));

export const PointMarkModalButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
  justifyContent: 'center',
}));

export const PointMarkModalButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 10,
  padding: theme.spacing(1, 2),
}));

export const PointMarkModalCancel = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: 10,
  padding: theme.spacing(1, 2),
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.action.hover,
  },
}));
