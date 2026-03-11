import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import { MAP_PANEL_MIN_WIDTH_PX, MAP_PANEL_WIDTH_PERCENT } from './mapLayersConstants';

export const MapLayersPane = styled(Box)(({ theme }) => ({
  width: `${MAP_PANEL_WIDTH_PERCENT}%`,
  minWidth: MAP_PANEL_MIN_WIDTH_PX,
  flexShrink: 0,
  borderLeft: '1px solid',
  borderColor: theme.palette.divider,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
}));

export const MapLayersHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  background: theme.palette.background.paper,
}));

export const MapLayersTitle = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  fontWeight: 600,
}));

export const MapLayersHeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const MapLayersHeaderButton = styled(Button)({
  textTransform: 'none',
  fontSize: '0.75rem',
  padding: '0.2rem 0.6rem',
  minWidth: 0,
});

export const MapLayersMapArea = styled(Box)({
  position: 'relative',
  flex: 1,
  minHeight: 0,
  '& .leaflet-container': {
    width: '100%',
    height: '100%',
  },
  '& .leaflet-popup-content': {
    maxHeight: '46vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: 4,
  },
});

export const MapPopupFieldList = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: theme.spacing(0.5, 1),
  minWidth: 160,
}));

export const MapPopupFieldLabel = styled('span')(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

export const MapPopupFieldValue = styled('span')({
  overflowWrap: 'anywhere',
});

export const MapInfoCard = styled('div')(({ theme }) => ({
  minWidth: 220,
  maxWidth: 320,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
  padding: theme.spacing(1, 1.25),
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
}));

export const MapInfoCardTitle = styled('div')(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(0.75),
  fontSize: theme.typography.pxToRem(13),
}));

export const MapInfoCardTitleRow = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.65),
}));

export const MapInfoCardGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: theme.spacing(0.4, 0.9),
  fontSize: theme.typography.pxToRem(12),
}));

export const MapInfoCardKey = styled('span')(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.secondary,
}));

export const MapInfoCardValue = styled('span')({
  overflowWrap: 'anywhere',
});

export const MapPopupEditButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  textTransform: 'none',
  fontSize: theme.typography.pxToRem(12),
  padding: theme.spacing(0.35, 0.9),
}));
