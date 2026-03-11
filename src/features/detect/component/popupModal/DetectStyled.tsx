import FormControl from '@mui/material/FormControl';
import { styled } from '@mui/material/styles';

export const DetectModalContent = styled('div')(({ theme }) => ({
  padding: theme.spacing(3.5),
  maxWidth: '90vw',
  textAlign: 'center',
}));

export const DetectColorRow = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  flexWrap: 'wrap',
}));

export const DetectColorLabel = styled('span')(({ theme }) => ({
  width: '100%',
  fontSize: theme.typography.pxToRem(13),
  fontWeight: 500,
  color: theme.palette.text.secondary,
  letterSpacing: '0.02em',
  marginBottom: theme.spacing(0.5),
}));

export const DetectColorSwatches = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  alignItems: 'center',
  justifyContent: 'center',
}));

export const DetectColorSwatch = styled('button')<{
  $selected?: boolean;
}>(({ theme, $selected }) => ({
  width: 'auto',
  height: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: 'transparent',
  padding: theme.spacing(0.25),
  lineHeight: 0,
  cursor: 'pointer',
  transition: 'transform 0.15s ease',
  '&:hover': {
    transform: 'scale(1.04)',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
  '& > span': {
    width: 24,
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease, filter 0.15s ease, opacity 0.15s ease',
    opacity: $selected ? 1 : 0.82,
    filter: $selected
      ? `drop-shadow(0 0 2px ${theme.palette.primary.main}) drop-shadow(0 0 6px ${theme.palette.primary.main})`
      : 'none',
    transform: $selected ? 'scale(1.12)' : 'scale(1)',
  },
  '& > span > svg': {
    width: '100%',
    height: '100%',
  },
}));

export const DetectSeriesFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  minWidth: 220,
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: 'rgba(0,0,0,0.02)',
    '& fieldset': {
      borderColor: theme.palette.divider,
      transition: 'border-color 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.action.hover,
    },
    '&.Mui-focused fieldset': {
      borderWidth: 2,
      borderColor: theme.palette.primary.main,
    },
    '& .MuiSelect-select': {
      textAlign: 'center',
      padding: theme.spacing(1.5, 2),
    },
  },
  '& .MuiInputLabel-root': {
    textAlign: 'center',
  },
}));
