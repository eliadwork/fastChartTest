import type { ModifierKey } from '../../../types'
import type { scichartFullDefinition } from '../scichartOptions'

import { useMemo } from 'react'

import { dashToStrokeArray } from '../convert'
import {
  SCI_CHART_DEFAULT_ROLLOVER_DASH,
  SCI_CHART_DEFAULT_ROLLOVER_STROKE,
  SCI_CHART_MODIFIER_KEY_MAP,
} from '../sciChartWrapperConstants'

const toModifierKey = (trigger: string): ModifierKey =>
  trigger === 'shift'
    ? 'Shift'
    : trigger === 'ctrl'
      ? 'Ctrl'
      : trigger === 'alt'
        ? 'Alt'
        : (trigger as ModifierKey)

export interface SciChartInteractionConfig {
  stretchEnable: boolean
  stretchOnRightClick: boolean
  stretchKey?: unknown
  panEnable: boolean
  panOnLeftClick: boolean
  panOnShift: boolean
  panKey?: unknown
  rolloverShow: boolean
  rolloverStroke: string
  rolloverDash: number[]
  onMiddleClick?: (
    event: MouseEvent,
    xValue: number,
    yValue: number,
    getSeriesVisibility?: () => boolean[]
  ) => void
}

export const useSciChartInteractionConfig = (
  definition: scichartFullDefinition
): SciChartInteractionConfig => {
  return useMemo(() => {
    const stretchEnable = definition.options.features.stretch.enable !== false
    const stretchTrigger = definition.options.features.stretch.trigger
    const stretchOnRightClick = stretchTrigger === 'rightClick'
    const stretchKey = stretchOnRightClick
      ? undefined
      : SCI_CHART_MODIFIER_KEY_MAP[toModifierKey(stretchTrigger)]

    const panEnable = definition.options.features.pan.enable !== false
    const panTrigger = definition.options.features.pan.trigger
    const panOnLeftClick = panTrigger === 'leftClick'
    const panOnShift = panTrigger === 'shift'
    const panKey = panOnLeftClick
      ? undefined
      : SCI_CHART_MODIFIER_KEY_MAP[toModifierKey(panTrigger)]

    return {
      stretchEnable,
      stretchOnRightClick,
      stretchKey,
      panEnable,
      panOnLeftClick,
      panOnShift,
      panKey,
      rolloverShow: definition.options.features.rollover.show !== false,
      rolloverStroke:
        definition.options.features.rollover.color ?? SCI_CHART_DEFAULT_ROLLOVER_STROKE,
      rolloverDash:
        dashToStrokeArray(definition.options.features.rollover.dash) ??
        SCI_CHART_DEFAULT_ROLLOVER_DASH,
      onMiddleClick: definition.options.events?.clicks.middle,
    }
  }, [definition])
}
