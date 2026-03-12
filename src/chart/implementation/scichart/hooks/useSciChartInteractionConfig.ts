import type { TriggerKey } from '../../../types'
import type { ResolvedSciChartOptions } from '../scichartOptions'

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
  options: ResolvedSciChartOptions
): SciChartInteractionConfig => {
  return useMemo(() => {
    const rolloverConfig = options.features.rollover
    const rolloverDash = rolloverConfig.show ? dashToStrokeArray(rolloverConfig.dash) : undefined

    const stretchEnable = options.features.stretch.enable
    const stretchTrigger = options.features.stretch.trigger ?? 'rightClick'
    const stretchOnRightClick = stretchTrigger === 'rightClick'
    const stretchKey = stretchOnRightClick
      ? undefined
      : SCI_CHART_MODIFIER_KEY_MAP[stretchTrigger as TriggerKey]

    const panEnable = options.features.pan.enable
    const panTrigger = options.features.pan.trigger ?? 'shift'
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
      rolloverShow: rolloverConfig.show,
      rolloverStroke: rolloverConfig.show ? rolloverConfig.color : '',
      rolloverDash: rolloverDash == null ? [] : rolloverDash,
      onMiddleClick: options.events?.clicks?.middle,
    }
  }, [options])
}
