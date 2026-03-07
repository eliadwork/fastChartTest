import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';

/** Default point mark icon: SVG circle. Use {{color}} placeholder for fill (replaced at render). SciChart uses this string. */
export const DEFAULT_POINT_MARK_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="{{color}}"/></svg>';

/** MUI icon component matching DEFAULT_POINT_MARK_ICON_SVG. Use in React UI (e.g. reset button). */
export const LogoIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8" fill="currentColor" />
  </SvgIcon>
);
