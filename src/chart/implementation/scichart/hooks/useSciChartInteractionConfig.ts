import type { ModifierKey } from '../../../types'
import type { SciChartMergedOptions } from './useSciChartMergedOptions'

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
  options: SciChartMergedOptions
): SciChartInteractionConfig => {
  return useMemo(() => {
    const stretchEnable = options.stretch?.enable !== false
    const stretchTrigger = options.stretch?.trigger ?? 'rightClick'
    const stretchOnRightClick = stretchTrigger === 'rightClick'
    const stretchKey = stretchOnRightClick
      ? undefined
      : SCI_CHART_MODIFIER_KEY_MAP[toModifierKey(stretchTrigger)]

    const panEnable = options.pan?.enable !== false
    const panTrigger = options.pan?.trigger ?? 'shift'
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
      rolloverShow: options.rolloverShow !== false,
      rolloverStroke: options.rolloverStroke ?? SCI_CHART_DEFAULT_ROLLOVER_STROKE,
      rolloverDash:
        dashToStrokeArray(options.rolloverDash) ?? SCI_CHART_DEFAULT_ROLLOVER_DASH,
      onMiddleClick: options.events?.onmiddleclick,
    }
  }, [options])
}
