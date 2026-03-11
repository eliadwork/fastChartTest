import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';

import { SERIES_PICKER_SELECT_FALLBACK_NAME_PREFIX } from './seriesPickerModalConstants';

const SeriesPickerSelectMenu = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  marginTop: theme.spacing(1),
  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
  '& .MuiMenuItem-root': {
    justifyContent: 'center',
  },
}));

export interface SeriesPickerSelectProps {
  labelId: string;
  label: string;
  value: number | '';
  onChange: (seriesIndex: number) => void;
  seriesOptions: number[];
  seriesNames: string[];
}

export const SeriesPickerSelect = ({
  labelId,
  label,
  value,
  onChange,
  seriesOptions,
  seriesNames,
}: SeriesPickerSelectProps) => (
  <Select
    labelId={labelId}
    label={label}
    value={value}
    onChange={(selectEvent) => onChange(Number(selectEvent.target.value))}
    MenuProps={{
      PaperProps: {
        component: SeriesPickerSelectMenu,
      },
    }}
  >
    {seriesOptions.map((seriesIndex) => (
      <MenuItem key={seriesIndex} value={seriesIndex}>
        {seriesNames[seriesIndex] ??
          `${SERIES_PICKER_SELECT_FALLBACK_NAME_PREFIX} ${seriesIndex}`}
      </MenuItem>
    ))}
  </Select>
);
