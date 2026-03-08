import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';

export interface UseChartHeaderStateOptions {
  title?: string;
  note?: string;
  textColor?: string;
  chartOnly: boolean;
  loading: boolean;
}

export const useChartHeaderState = ({
  title,
  note,
  textColor,
  chartOnly,
  loading,
}: UseChartHeaderStateOptions) => {
  const theme = useTheme();

  const showHeader = !chartOnly && (title != null || note != null || !loading);

  const headerSx = useMemo(
    () => ({
      ...(theme.palette.background.paper
        ? { backgroundColor: theme.palette.background.paper }
        : {}),
      ...(textColor ? { color: textColor } : {}),
    }),
    [theme.palette.background.paper, textColor]
  );

  return {
    showHeader,
    headerSx,
  };
};
