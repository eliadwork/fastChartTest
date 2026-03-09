import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const SeriesPickerModalOverlay = styled(Dialog)(({ theme }) => ({
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

export const SeriesPickerModalTitle = styled(Typography)(({ theme }) => ({
  margin: 0,
  marginBottom: theme.spacing(2),
  fontSize: theme.typography.pxToRem(18),
  fontWeight: 600,
  letterSpacing: '-0.01em',
  lineHeight: 1.35,
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

export const SeriesPickerSelectSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  '&:last-of-type': {
    marginBottom: 0,
  },
}));

export const SeriesPickerModalSectionLabel = styled('span')(({ theme }) => ({
  display: 'block',
  fontSize: theme.typography.pxToRem(13),
  fontWeight: 500,
  color: theme.palette.text.secondary,
  letterSpacing: '0.02em',
  marginBottom: theme.spacing(1),
  textAlign: 'center',
}));

export const SeriesPickerModalButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
  justifyContent: 'center',
}));

export const SeriesPickerModalButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 10,
  padding: theme.spacing(1, 2),
}));
