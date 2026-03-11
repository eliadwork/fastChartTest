import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import {
  SHARED_MODAL_ACTION_GAP,
  SHARED_MODAL_ACTION_TOP_MARGIN,
  SHARED_MODAL_ACTION_TOP_PADDING,
  SHARED_MODAL_BACKDROP_COLOR,
  SHARED_MODAL_BORDER_RADIUS,
  SHARED_MODAL_LABEL_FONT_WEIGHT,
  SHARED_MODAL_MAX_WIDTH,
  SHARED_MODAL_PADDING,
  SHARED_MODAL_SECTION_GAP,
  SHARED_MODAL_TITLE_FONT_WEIGHT,
} from './modalConstants';

export const SharedModalOverlay = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    border: '1px solid',
    borderColor: theme.palette.divider,
    borderRadius: SHARED_MODAL_BORDER_RADIUS,
    padding: 0,
    maxWidth: SHARED_MODAL_MAX_WIDTH,
    boxShadow:
      '0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: SHARED_MODAL_BACKDROP_COLOR,
    backdropFilter: 'blur(2px)',
  },
}));

export const SharedModalSurface = styled(Box)(({ theme }) => ({
  padding: theme.spacing(SHARED_MODAL_PADDING),
  maxWidth: SHARED_MODAL_MAX_WIDTH,
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
}));

export const SharedModalContent = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  overflowX: 'hidden',
  paddingRight: theme.spacing(0.5),
}));

export const SharedModalTitle = styled(Typography)(({ theme }) => ({
  margin: 0,
  marginBottom: theme.spacing(2),
  fontSize: theme.typography.pxToRem(18),
  fontWeight: SHARED_MODAL_TITLE_FONT_WEIGHT,
  letterSpacing: '-0.01em',
  lineHeight: 1.35,
  color: theme.palette.text.primary,
  textAlign: 'center',
}));

export const SharedModalSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(SHARED_MODAL_SECTION_GAP),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  '&:last-of-type': {
    marginBottom: 0,
  },
}));

export const SharedModalSectionLabel = styled('span')(({ theme }) => ({
  display: 'block',
  fontSize: theme.typography.pxToRem(13),
  fontWeight: SHARED_MODAL_LABEL_FONT_WEIGHT,
  color: theme.palette.text.secondary,
  letterSpacing: '0.02em',
  marginBottom: theme.spacing(1),
  textAlign: 'center',
}));

export const SharedModalActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  flexShrink: 0,
  gap: theme.spacing(SHARED_MODAL_ACTION_GAP),
  marginTop: theme.spacing(SHARED_MODAL_ACTION_TOP_MARGIN),
  paddingTop: theme.spacing(SHARED_MODAL_ACTION_TOP_PADDING),
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
  justifyContent: 'center',
}));

export const SharedModalActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 10,
  padding: theme.spacing(1, 2),
}));
