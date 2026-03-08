/**
 * Info icon with tooltip. Used for "how to use" hints.
 */

import Tooltip from '@mui/material/Tooltip';

import { INFO_TOOLTIP_ARIA_LABEL } from './infoTooltipConstants';
import { InfoTooltipIcon, InfoTooltipRoot } from './InfoTooltipStyled';

export interface InfoTooltipProps {
  /** Tooltip content. */
  title: React.ReactNode;
  /** Icon color. Default: inherit. */
  color?: string;
  /** Icon size. Default: '0.9rem'. */
  fontSize?: string | number;
}

export const InfoTooltip = ({
  title,
  color,
  fontSize,
}: InfoTooltipProps) => (
  <Tooltip title={title}>
    <InfoTooltipRoot
      sx={color != null ? { color } : undefined}
      aria-label={INFO_TOOLTIP_ARIA_LABEL}
    >
      <InfoTooltipIcon $fontSize={fontSize} />
    </InfoTooltipRoot>
  </Tooltip>
);
