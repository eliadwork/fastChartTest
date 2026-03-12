import { HorizontalLineAnnotation, SciChartSurface, VerticalLineAnnotation } from 'scichart';

import { SCI_CHART_ZERO_LINE_STROKE_THICKNESS } from '../../sciChartWrapperConstants';

export const addZeroLineAnnotations = (surface: SciChartSurface, zeroLineColor: string) => {
  surface.annotations.add(
    new VerticalLineAnnotation({
      x1: 0,
      stroke: zeroLineColor,
      strokeThickness: SCI_CHART_ZERO_LINE_STROKE_THICKNESS,
    })
  );

  surface.annotations.add(
    new HorizontalLineAnnotation({
      y1: 0,
      stroke: zeroLineColor,
      strokeThickness: SCI_CHART_ZERO_LINE_STROKE_THICKNESS,
    })
  );
};
