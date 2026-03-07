import Tooltip from '@mui/material/Tooltip'
import { ChartToolbarButtonBase } from '../styled/ChartStyled'

export interface ChartToolbarButtonProps
  extends React.ComponentProps<typeof ChartToolbarButtonBase> {
  tooltip: string
  /** Resolved text color (e.g. from theme). When provided, applied as default; passed sx overrides. */
  textColor?: string
}

export const ChartToolbarButton = ({
  tooltip,
  disabled,
  textColor,
  sx,
  children,
  ...buttonProps
}: ChartToolbarButtonProps) => {
  const defaultSx = textColor
    ? { color: textColor, borderColor: textColor }
    : undefined
  const mergedSx = defaultSx && sx ? { ...defaultSx, ...sx } : sx ?? defaultSx

  const button = (
    <ChartToolbarButtonBase
      disabled={disabled}
      variant="outlined"
      size="small"
      sx={mergedSx}
      {...buttonProps}
    >
      {children}
    </ChartToolbarButtonBase>
  )
  const wrapped = disabled ? <span>{button}</span> : button
  return <Tooltip title={tooltip}>{wrapped}</Tooltip>
}
