import { styled } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {
  INFO_TOOLTIP_FONT_SIZE_DEFAULT,
  INFO_TOOLTIP_OPACITY_DEFAULT,
  INFO_TOOLTIP_OPACITY_HOVER,
} from './infoTooltipConstants';

export const InfoTooltipRoot = styled('span')({
  display: 'inline-flex',
  opacity: INFO_TOOLTIP_OPACITY_DEFAULT,
  cursor: 'help',
  flexShrink: 0,
  '&:hover': { opacity: INFO_TOOLTIP_OPACITY_HOVER },
});

export interface InfoTooltipIconProps {
  $fontSize?: string | number;
}

export const InfoTooltipIcon = styled(InfoOutlinedIcon, {
  shouldForwardProp: (prop) => prop !== '$fontSize',
})<InfoTooltipIconProps>(({ $fontSize = INFO_TOOLTIP_FONT_SIZE_DEFAULT }) => ({
  fontSize: $fontSize,
}));
