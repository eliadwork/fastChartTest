import type { TriggerKey } from '../../../types'
import type { SciChartMergedOptions } from './useSciChartMergedOptions'

import { useMemo } from 'react'

import { dashToStrokeArray } from '../convert'
import {
  SCI_CHART_MODIFIER_KEY_MAP,
} from '../sciChartWrapperConstants'

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
  onMiddleClick?: (event: MouseEvent) => void
}

export const useSciChartInteractionConfig = (
  options: SciChartMergedOptions
): SciChartInteractionConfig => {
  return useMemo(() => {
    const rolloverDash = dashToStrokeArray(options.rolloverDash)

    const stretchEnable = options.stretch.enable
    const stretchTrigger = options.stretch.trigger
    const stretchOnRightClick = stretchTrigger === 'rightClick'
    const stretchKey = stretchOnRightClick
      ? undefined
      : SCI_CHART_MODIFIER_KEY_MAP[stretchTrigger as TriggerKey]

    const panEnable = options.pan.enable
    const panTrigger = options.pan.trigger
    const panOnLeftClick = panTrigger === 'leftClick'
    const panOnShift = panTrigger === 'shift'
    const panKey = panOnLeftClick
      ? undefined
      : SCI_CHART_MODIFIER_KEY_MAP[panTrigger as TriggerKey]

    return {
      stretchEnable,
      stretchOnRightClick,
      stretchKey,
      panEnable,
      panOnLeftClick,
      panOnShift,
      panKey,
      rolloverShow: options.rolloverShow,
      rolloverStroke: options.rolloverStroke,
      rolloverDash: rolloverDash == null ? [] : rolloverDash,
      onMiddleClick: options.events?.onmiddleclick,
    }
  }, [options])
}
