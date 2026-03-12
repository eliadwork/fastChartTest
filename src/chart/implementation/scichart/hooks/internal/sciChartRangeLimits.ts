import { NumberRange, SciChartSurface } from 'scichart';

import type { SciChartDataBounds } from '../../scichartOptions';
import { SCI_CHART_VISIBLE_RANGE_PAD_FACTOR } from '../../sciChartWrapperConstants';

interface AxisWithVisibleRangeLimit {
  visibleRangeLimit?: NumberRange;
}

const getPaddedLimit = (value: number) =>
  value === 0 ? 1 : Math.abs(value) * SCI_CHART_VISIBLE_RANGE_PAD_FACTOR;

export const applyVisibleRangeLimits = (
  surface: SciChartSurface,
  dataBounds: SciChartDataBounds,
  clipZoomToData: boolean
) => {
  const xAxis = surface.xAxes.asArray()[0] as AxisWithVisibleRangeLimit | undefined;
  const yAxis = surface.yAxes.asArray()[0] as AxisWithVisibleRangeLimit | undefined;

  if (!xAxis || !yAxis) {
    return;
  }

  if (!clipZoomToData || !dataBounds.hasValidBounds) {
    xAxis.visibleRangeLimit = undefined;
    yAxis.visibleRangeLimit = undefined;
    return;
  }

  xAxis.visibleRangeLimit = new NumberRange(
    dataBounds.xMin - getPaddedLimit(dataBounds.xMin),
    dataBounds.xMax + getPaddedLimit(dataBounds.xMax)
  );
  yAxis.visibleRangeLimit = new NumberRange(
    dataBounds.yMin - getPaddedLimit(dataBounds.yMin),
    dataBounds.yMax + getPaddedLimit(dataBounds.yMax)
  );
};
