/**
 * Skeleton loading placeholder for async content.
 * Fills the parent container with spacing.
 */

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

export interface SkeletonLoadingProps {
  /** Skeleton animation. Default: "wave". */
  animation?: 'wave' | 'pulse' | false;
}

export const SkeletonLoading = ({ animation = 'wave' }: SkeletonLoadingProps) => (
  <Box
    sx={{
      flex: 1,
      height: '100%',
      width: '100%',
      minHeight: 0,
      position: 'relative',
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        boxSizing: 'border-box',
      }}
    >
      <Skeleton animation={animation} variant="rectangular" sx={{ flex: 1, borderRadius: 1 }} />
    </Box>
  </Box>
);
