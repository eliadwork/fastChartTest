import { EExecuteOn, EModifierMouseArgKey } from 'scichart';

import type { TriggerKey } from '../../../types';

export interface SciChartModifierExecuteCondition {
  key?: EModifierMouseArgKey;
  button?: EExecuteOn;
}

export const toModifierExecuteCondition = (
  trigger: TriggerKey
): SciChartModifierExecuteCondition => {
  switch (trigger) {
    case 'leftClick':
      return {
        key: EModifierMouseArgKey.None,
        button: EExecuteOn.MouseLeftButton,
      };
    case 'rightClick':
      return {
        key: EModifierMouseArgKey.None,
        button: EExecuteOn.MouseRightButton,
      };
    case 'shift':
      return {
        key: EModifierMouseArgKey.Shift,
        button: EExecuteOn.MouseLeftButton,
      };
    case 'ctrl':
      return {
        key: EModifierMouseArgKey.Ctrl,
        button: EExecuteOn.MouseLeftButton,
      };
    case 'alt':
      return {
        key: EModifierMouseArgKey.Alt,
        button: EExecuteOn.MouseLeftButton,
      };
  }
};
