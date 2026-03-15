import {
  MouseWheelZoomModifier,
  RolloverModifier,
  RubberBandXyZoomModifier,
  ZoomExtentsModifier,
  ZoomPanModifier,
} from 'scichart';

import type { ChartZoomCallbacks } from '../../../implementationProps';
import { dashToStrokeArray } from '../../convert';
import { AxisStretchModifier } from '../../modifiers/AxisStretchModifier';
import { MiddleClickModifier } from '../../modifiers/MiddleClickModifier';
import { toModifierExecuteCondition } from '../../modifiers/modifierExecuteCondition';
import { ZoomHistoryModifier } from '../../modifiers/ZoomHistoryModifier';
import type { ResolvedSciChartOptions } from '../../scichartOptions';
import { SCI_CHART_STRETCH_SENSITIVITY } from '../../sciChartWrapperConstants';

const ROLLOVER_TOOLTIP_SERIES_LABEL = (seriesName: string) => `${seriesName}:`;
const ROLLOVER_TOOLTIP_X_LABEL = (formattedX: string) => `X: ${formattedX}`;
const ROLLOVER_TOOLTIP_Y_LABEL = (formattedY: string) => `Y: ${formattedY}`;

export interface CreateSciChartModifiersOptions {
  interactionOptions: Pick<ResolvedSciChartOptions, 'features' | 'events'>;
  zoomCallbacks?: ChartZoomCallbacks;
}

export const createSciChartModifiers = ({
  interactionOptions,
}: CreateSciChartModifiersOptions): InstanceType<
  typeof import('scichart').ChartModifierBase2D
>[] => {
  const stretchConfig = interactionOptions.features.stretch;
  const panConfig = interactionOptions.features.pan;
  const rolloverConfig = interactionOptions.features.rollover;

  const modifiers: InstanceType<typeof import('scichart').ChartModifierBase2D>[] = [
    new MiddleClickModifier({
      onMiddleClick: interactionOptions.events?.clicks?.middle,
    }),
    new ZoomHistoryModifier({
      callbacks: interactionOptions.events?.zoom
        ? {
            setZoomBack: interactionOptions.events?.zoom?.setZoomBack,
            setPushBeforeReset: interactionOptions.events?.zoom?.setPushBeforeReset,
            setCanZoomBack: interactionOptions.events?.zoom?.setCanZoomBack,
          }
        : undefined,
    }),
    new RubberBandXyZoomModifier({
      executeCondition: toModifierExecuteCondition('leftClick'),
    }),
  ];

  if (stretchConfig.enable) {
    modifiers.push(
      new AxisStretchModifier({
        executeCondition: toModifierExecuteCondition(stretchConfig.trigger),
        sensitivity: SCI_CHART_STRETCH_SENSITIVITY,
      })
    );
  }

  if (panConfig.enable) {
    modifiers.push(
      new ZoomPanModifier({
        executeCondition: toModifierExecuteCondition(panConfig.trigger),
      })
    );
  }

  modifiers.push(new MouseWheelZoomModifier(), new ZoomExtentsModifier());

  if (rolloverConfig.show) {
    const rolloverDash = dashToStrokeArray(rolloverConfig.dash);

    modifiers.push(
      new RolloverModifier({
        tooltipDataTemplate: (seriesInfo) => [
          ROLLOVER_TOOLTIP_SERIES_LABEL(seriesInfo.seriesName),
          ROLLOVER_TOOLTIP_X_LABEL(seriesInfo.formattedXValue),
          ROLLOVER_TOOLTIP_Y_LABEL(seriesInfo.formattedYValue),
        ],
        rolloverLineStroke: rolloverConfig.color,
        rolloverLineStrokeDashArray: rolloverDash == null ? [] : rolloverDash,
      })
    );
  }

  return modifiers;
};
