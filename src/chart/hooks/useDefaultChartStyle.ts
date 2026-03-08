import type { ChartStyle } from '../types';

import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

export const useDefaultChartStyle = (): ChartStyle => {
  const theme = useTheme();
  return useMemo(
    () => ({
      backgroundColor: theme.palette.background.paper,
      rollover: {
        show: true,
        color: '#FF0000',
        dash: { isDash: true, steps: [8, 4] },
      },
      textColor: theme.palette.text.primary,
      chartOnly: false,
    }),
    [theme]
  );
};
