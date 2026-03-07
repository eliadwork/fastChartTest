import Tooltip from '@mui/material/Tooltip'
import { ChartToolbarButtonBase } from '../styled/ChartStyled'

export interface ChartToolbarButtonProps
  extends React.ComponentProps<typeof ChartToolbarButtonBase> {
  tooltip: string
}

export const ChartToolbarButton = ({
  tooltip,
  disabled,
  children,
  ...buttonProps
}: ChartToolbarButtonProps) => {
  const button = (
    <ChartToolbarButtonBase disabled={disabled} {...buttonProps} variant={'outlined'}
    size={'small'}>
      {children}
    </ChartToolbarButtonBase>
  )
  const wrapped = disabled ? <span>{button}</span> : button
  return <Tooltip title={tooltip}>{wrapped}</Tooltip>
}
