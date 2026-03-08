import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
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
  $backgroundColor?: string;
}>(({ theme, $selected, $backgroundColor }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: $backgroundColor ?? 'transparent',
  border: $selected ? `3px solid ${theme.palette.primary.main}` : '2px solid transparent',
  padding: 0,
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  boxShadow: $selected ? `0 0 0 2px ${theme.palette.background.paper}` : 'none',
  '&:hover': {
    transform: 'scale(1.08)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

export const DetectSeriesFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  minWidth: 220,
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1.5),
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.02)',
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

const DetectSelectMenu = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  marginTop: theme.spacing(1),
  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
  '& .MuiMenuItem-root': {
    justifyContent: 'center',
  },
}));

export interface DetectSeriesSelectProps {
  labelId: string;
  label: string;
  value: number | '';
  onChange: (seriesIndex: number) => void;
  seriesOptions: number[];
  seriesNames: string[];
}

export const DetectSeriesSelect = ({
  labelId,
  label,
  value,
  onChange,
  seriesOptions,
  seriesNames,
}: DetectSeriesSelectProps) => (
  <Select
    labelId={labelId}
    label={label}
    value={value}
    onChange={(selectEvent) => onChange(Number(selectEvent.target.value))}
    MenuProps={{
      PaperProps: {
        component: DetectSelectMenu,
      },
    }}
  >
    {seriesOptions.map((seriesIndex) => (
      <MenuItem key={seriesIndex} value={seriesIndex}>
        {seriesNames[seriesIndex] ?? `Series ${seriesIndex}`}
      </MenuItem>
    ))}
  </Select>
);
