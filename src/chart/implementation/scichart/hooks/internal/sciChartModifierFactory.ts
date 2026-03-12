import { EModifierMouseArgKey, MouseWheelZoomModifier, RolloverModifier, ZoomExtentsModifier, ZoomPanModifier } from 'scichart';

import type { ChartZoomCallbacks } from '../../../implementationProps';
import { AxisStretchModifier } from '../../modifiers/AxisStretchModifier';
import { LeftClickRubberBandXyZoomModifier } from '../../modifiers/LeftClickRubberBandXyZoomModifier';
import { LeftClickZoomPanModifier } from '../../modifiers/LeftClickZoomPanModifier';
import { PointMarkModifier } from '../../modifiers/PointMarkModifier';
import { ShiftLeftClickZoomPanModifier } from '../../modifiers/ShiftLeftClickZoomPanModifier';
import { ZoomHistoryModifier } from '../../modifiers/ZoomHistoryModifier';
import { SCI_CHART_STRETCH_SENSITIVITY } from '../../sciChartWrapperConstants';
import type { SciChartInteractionConfig } from '../useSciChartInteractionConfig';

const ROLLOVER_TOOLTIP_SERIES_LABEL = (seriesName: string) => `${seriesName}:`;
const ROLLOVER_TOOLTIP_X_LABEL = (formattedX: string) => `X: ${formattedX}`;
const ROLLOVER_TOOLTIP_Y_LABEL = (formattedY: string) => `Y: ${formattedY}`;

export interface CreateSciChartModifiersOptions {
  interactionConfig: SciChartInteractionConfig;
  zoomCallbacks?: ChartZoomCallbacks;
}

export const createSciChartModifiers = ({
  interactionConfig,
  zoomCallbacks,
}: CreateSciChartModifiersOptions): InstanceType<typeof import('scichart').ChartModifierBase2D>[] => {
  const modifiers: InstanceType<typeof import('scichart').ChartModifierBase2D>[] = [
    new PointMarkModifier({
      onMiddleClick: interactionConfig.onMiddleClick,
    }),
    new ZoomHistoryModifier({
      callbacks: zoomCallbacks
        ? {
            setZoomBack: zoomCallbacks.setZoomBack,
            setPushBeforeReset: zoomCallbacks.setPushBeforeReset,
            setCanZoomBack: zoomCallbacks.setCanZoomBack,
          }
        : undefined,
    }),
    new LeftClickRubberBandXyZoomModifier({
      executeCondition: { key: EModifierMouseArgKey.None },
    }),
  ];

  if (interactionConfig.stretchEnable) {
    modifiers.push(
      new AxisStretchModifier({
        executeOnRightClick: interactionConfig.stretchOnRightClick,
        executeCondition:
          interactionConfig.stretchKey != null
            ? {
                key: interactionConfig.stretchKey as EModifierMouseArgKey,
              }
            : undefined,
        sensitivity: SCI_CHART_STRETCH_SENSITIVITY,
      })
    );
  }

  if (interactionConfig.panEnable) {
    modifiers.push(
      new (interactionConfig.panOnShift
        ? ShiftLeftClickZoomPanModifier
        : interactionConfig.panOnLeftClick
          ? LeftClickZoomPanModifier
          : ZoomPanModifier)({
        executeCondition: {
          key: interactionConfig.panOnShift
            ? EModifierMouseArgKey.Shift
            : ((interactionConfig.panKey as EModifierMouseArgKey | undefined) ??
              EModifierMouseArgKey.None),
        },
      })
    );
  }

  modifiers.push(new MouseWheelZoomModifier(), new ZoomExtentsModifier());

  if (interactionConfig.rolloverShow) {
    modifiers.push(
      new RolloverModifier({
        tooltipDataTemplate: (seriesInfo) => [
          ROLLOVER_TOOLTIP_SERIES_LABEL(seriesInfo.seriesName),
          ROLLOVER_TOOLTIP_X_LABEL(seriesInfo.formattedXValue),
          ROLLOVER_TOOLTIP_Y_LABEL(seriesInfo.formattedYValue),
        ],
        rolloverLineStroke: interactionConfig.rolloverStroke,
        rolloverLineStrokeDashArray: interactionConfig.rolloverDash,
      })
    );
  }

  return modifiers;
};
