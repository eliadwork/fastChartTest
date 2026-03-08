/**
 * Centralized chart icons.
 * Change icons here to update across the app.
 */

import { DEFAULT_POINT_MARK_ICON_SVG } from './pointMarkIcon';

export { default as ChartZoomBackIcon } from '@mui/icons-material/Undo';
export { default as ChartZoomResetIcon } from '@mui/icons-material/FitScreen';
export { default as ChartVisibilityOnIcon } from '@mui/icons-material/Visibility';
export { default as ChartVisibilityOffIcon } from '@mui/icons-material/VisibilityOff';
export { default as ChartInfoIcon } from '@mui/icons-material/InfoOutlined';

/** Example chart annotation icons for the icons prop. */
export const chartIcons = [
  {
    iconImage: DEFAULT_POINT_MARK_ICON_SVG,
    location: { x: 250000, y: 0 },
    color: '#888888',
  },
];
