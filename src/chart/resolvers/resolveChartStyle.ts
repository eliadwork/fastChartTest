import { withOpacity } from '../../utils/colorUtils';
import {
  CHART_BACKGROUND_OPACITY_DEFAULT,
  CHART_DEFAULT_ICON_COLOR,
  CHART_DEFAULT_SERIES_COLORS,
  CHART_DEFAULT_STROKE_THICKNESS,
  CHART_FALLBACK_BACKGROUND,
  CHART_FALLBACK_ROLLOVER_STROKE,
  CHART_FALLBACK_TEXT_COLOR,
  CHART_ROLLOVER_DASH_STEPS,
  DEFAULT_LEGEND_BACKGROUND_COLOR,
  DEFAULT_ZERO_LINE_COLOR,
} from '../defaultsChartStyles';
import type { ChartStyle } from '../types';

export interface ResolveChartStyleParams {
  chartStyle?: ChartStyle;
  themeBackgroundColor?: string;
  themeTextColor?: string;
}

const resolveBackgroundColor = (themeBackgroundColor?: string): string =>
  themeBackgroundColor != null
    ? withOpacity(themeBackgroundColor, CHART_BACKGROUND_OPACITY_DEFAULT)
    : CHART_FALLBACK_BACKGROUND;

const resolveTextColor = (themeTextColor?: string): string =>
  themeTextColor ?? CHART_FALLBACK_TEXT_COLOR;

export const resolveChartStyle = ({
  chartStyle,
  themeBackgroundColor,
  themeTextColor,
}: ResolveChartStyleParams): ChartStyle => {
  const fallbackBackgroundColor = resolveBackgroundColor(themeBackgroundColor);
  const fallbackTextColor = resolveTextColor(themeTextColor);

  return {
    backgroundColor: chartStyle?.backgroundColor ?? fallbackBackgroundColor,
    rollover: {
      show: chartStyle?.rollover.show ?? true,
      color: chartStyle?.rollover.color ?? CHART_FALLBACK_ROLLOVER_STROKE,
      dash: chartStyle?.rollover.dash ?? { isDash: true, steps: [...CHART_ROLLOVER_DASH_STEPS] },
    },
    textColor: chartStyle?.textColor ?? fallbackTextColor,
    defaults: {
      seriesColors: chartStyle?.defaults?.seriesColors ?? [...CHART_DEFAULT_SERIES_COLORS],
      strokeThickness: chartStyle?.defaults?.strokeThickness ?? CHART_DEFAULT_STROKE_THICKNESS,
      iconColor: chartStyle?.defaults?.iconColor ?? CHART_DEFAULT_ICON_COLOR,
    },
    legendBackgroundColor: chartStyle?.legendBackgroundColor ?? DEFAULT_LEGEND_BACKGROUND_COLOR,
    zeroLineColor: chartStyle?.zeroLineColor ?? DEFAULT_ZERO_LINE_COLOR,
    chartOnly: chartStyle?.chartOnly ?? false,
  };
};
