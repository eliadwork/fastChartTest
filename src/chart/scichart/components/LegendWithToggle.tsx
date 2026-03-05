/**
 * LegendWithToggle – Legend (disable/enable button is in the header toolbar).
 */

import { Legend } from './Legend'

export interface LegendWithToggleProps {
  backgroundColor?: string
  textColor?: string
  seriesVisibility?: boolean[]
  seriesGroupKeys?: (string | undefined)[]
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
  onDisableAll?: () => void
  disableAllLabel?: string
  enableAllLabel?: string
  textColorForButton?: string
}

export const LegendWithToggle = ({
  backgroundColor,
  textColor,
  seriesVisibility,
  seriesGroupKeys,
  onSeriesVisibilityChange,
  onSeriesVisibilityGroupChange,
}: LegendWithToggleProps) => (
  <Legend
    backgroundColor={backgroundColor}
    textColor={textColor}
    seriesVisibility={seriesVisibility}
    seriesGroupKeys={seriesGroupKeys}
    onSeriesVisibilityChange={onSeriesVisibilityChange}
    onSeriesVisibilityGroupChange={onSeriesVisibilityGroupChange}
  />
)
