/**
 * SciChart data and shape conversion.
 * Converts generic chart contracts into scichartFullDefinition.
 */

import { EResamplingMode } from 'scichart';

import { type ChartData, type DashConfig } from '../../types';
import type { ChartImplementationProps } from '../implementationProps';
import type {
  ResolvedSciChartDashConfig,
  ResolvedSciChartData,
  ResolvedSciChartDataSeries,
  ResolvedSciChartDefinition,
  ResolvedSciChartFeaturesOptions,
  ResolvedSciChartIcon,
  ResolvedSciChartLineStyle,
  ResolvedSciChartOptions,
  ResolvedSciChartOptionsEvents,
  ResolvedSciChartResamplingOption,
  ResolvedSciChartShape,
  ResolvedScichartStyles,
} from './scichartOptions';
import {
  SCI_CHART_DEFAULT_ROLLOVER_DASH,
  SCI_CHART_DEFAULT_ROLLOVER_STROKE,
  SCI_CHART_DEFAULT_SERIES_COLORS,
  SCI_CHART_DEFAULT_STROKE_THICKNESS,
  SCI_CHART_DEFAULT_TEXT_COLOR,
  SCI_CHART_DEFAULT_ZERO_LINE_COLOR,
  SCI_CHART_DEFAULT_ICON_SIZE,
  SCI_CHART_RESAMPLING_PRECISION_DEFAULT,
} from './sciChartWrapperConstants';

type SciChartConvertInput = Pick<ChartImplementationProps, 'lines' | 'style' | 'options'>;
type SciChartConvertOptionsInput = SciChartConvertInput['options'];
type SciChartConvertStyleInput = SciChartConvertInput['style'];
type SciChartConvertShapesInput = SciChartConvertOptionsInput['shapes'];
type SciChartConvertIconsInput = SciChartConvertOptionsInput['icons'];

/** Convert DashConfig to SciChart strokeDashArray. Returns undefined for solid lines. */
export const dashToStrokeArray = (dash?: DashConfig): number[] | undefined =>
  dash?.isDash && dash.steps?.length ? dash.steps : undefined;

const SCI_CHART_DEFAULT_ICON_COLOR = '#3388ff';
const SCI_CHART_DEFAULT_BACKGROUND_COLOR = '#1a1a1a33';
const SCI_CHART_DEFAULT_SHAPE_COLOR = '#ff0000';
const DEFAULT_STRETCH_TRIGGER = 'rightClick';
const DEFAULT_PAN_TRIGGER = 'shift';

const resolveDashConfig = (
  dash: { isDash?: boolean; steps?: number[] } | undefined
): ResolvedSciChartDashConfig => ({
  isDash: dash?.isDash ?? false,
  steps: dash?.steps == null ? [] : [...dash.steps],
});

const resolveSeriesVisibility = (
  length: number,
  sourceSeriesVisibility: SciChartConvertOptionsInput['seriesVisibility']
): boolean[] => {
  const resolvedVisibility: boolean[] = [];
  for (let index = 0; index < length; index += 1) {
    resolvedVisibility.push(sourceSeriesVisibility?.[index] ?? true);
  }
  return resolvedVisibility;
};

const resolveStyles = (style: SciChartConvertStyleInput): ResolvedScichartStyles => {
  const seriesColors =
    style.defaults?.seriesColors != null && style.defaults.seriesColors.length > 0
      ? [...style.defaults.seriesColors]
      : [...SCI_CHART_DEFAULT_SERIES_COLORS];

  const baseLineStyle: ResolvedSciChartLineStyle = {
    color: seriesColors[0] ?? SCI_CHART_DEFAULT_SHAPE_COLOR,
    thickness: style.defaults?.strokeThickness ?? SCI_CHART_DEFAULT_STROKE_THICKNESS,
    dash: resolveDashConfig(undefined),
  };

  return {
    chartOnly: style.chartOnly ?? false,
    backgroundColor: style.backgroundColor ?? SCI_CHART_DEFAULT_BACKGROUND_COLOR,
    textColor: style.textColor ?? SCI_CHART_DEFAULT_TEXT_COLOR,
    zeroLineColor: style.zeroLineColor ?? SCI_CHART_DEFAULT_ZERO_LINE_COLOR,
    defaultStyles: {
      seriesColors,
      lineStyles: baseLineStyle,
      iconColor: style.defaults?.iconColor ?? SCI_CHART_DEFAULT_ICON_COLOR,
    },
  };
};

const resolveSeriesStyle = (
  line: ChartData[number],
  index: number,
  styles: ResolvedScichartStyles
): ResolvedSciChartLineStyle => {
  const fallbackColor =
    styles.defaultStyles.seriesColors[index % styles.defaultStyles.seriesColors.length] ??
    styles.defaultStyles.lineStyles.color;

  return {
    color: line.style.color ?? fallbackColor,
    thickness: line.style.thickness ?? styles.defaultStyles.lineStyles.thickness,
    dash: resolveDashConfig(line.style.dash ?? styles.defaultStyles.lineStyles.dash),
  };
};

const resolveIcons = (
  icons: SciChartConvertIconsInput,
  defaultColor: string
): ResolvedSciChartIcon[] => {
  if (icons == null || icons.length === 0) {
    return [];
  }

  return icons.map((icon) => ({
    iconImage: icon.iconImage,
    location: icon.location,
    color: icon.color ?? defaultColor,
    size: icon.size ?? SCI_CHART_DEFAULT_ICON_SIZE,
  }));
};

const resolveShapes = (shapes: SciChartConvertShapesInput): ResolvedSciChartShape[] => {
  const resolvedShapes: ResolvedSciChartShape[] = [];
  for (const shape of shapes) {
    if (shape.shape === 'box') {
      resolvedShapes.push({
        shape: 'box',
        name: shape.name,
        color: shape.color,
        fill: shape.fill,
        coordinates: {
          x1: shape.coordinates.x1,
          x2: shape.coordinates.x2,
          y1: shape.coordinates.y1,
          y2: shape.coordinates.y2,
        },
        dash: shape.dash,
      });
      continue;
    }

    resolvedShapes.push({
      shape: 'line',
      axis: shape.axis,
      value: shape.value,
      color: shape.color,
      dash: shape.dash,
    });
  }

  return resolvedShapes;
};

export function toFloat64Array(arr: ArrayLike<number> | number[]): Float64Array {
  if (Object.prototype.toString.call(arr) === '[object Float64Array]') return arr as Float64Array;
  return new Float64Array(arr);
}

const convertSeries = (
  line: ChartData[number],
  index: number,
  styles: ResolvedScichartStyles
): ResolvedSciChartDataSeries => ({
  x: toFloat64Array(line.x),
  y: toFloat64Array(line.y),
  name: line.name,
  lineGroupKey: line.lineGroupKey,
  style: resolveSeriesStyle(line, index, styles),
});

export function convertData(
  data: ChartData,
  seriesVisibility: boolean[],
  styles: ResolvedScichartStyles
): ResolvedSciChartData {
  return {
    series: data.map((line, index) => convertSeries(line, index, styles)),
    seriesVisibility,
  };
}

const resolveFeatures = (
  options: SciChartConvertOptionsInput,
  style: SciChartConvertStyleInput
): ResolvedSciChartFeaturesOptions => {
  const stretchEnabled = options?.stretch?.enable ?? true;
  const panEnabled = options?.pan?.enable ?? true;

  return {
    stretch: stretchEnabled
      ? {
          enable: true,
          trigger: options?.stretch?.trigger ?? DEFAULT_STRETCH_TRIGGER,
        }
      : { enable: false },
    pan: panEnabled
      ? {
          enable: true,
          trigger: options?.pan?.trigger ?? DEFAULT_PAN_TRIGGER,
        }
      : { enable: false },
    rollover: style.rollover?.show
      ? {
          show: style.rollover?.show ?? true,
          color: style.rollover?.color ?? SCI_CHART_DEFAULT_ROLLOVER_STROKE,
          dash: resolveDashConfig(
            style.rollover?.dash ?? { isDash: true, steps: [...SCI_CHART_DEFAULT_ROLLOVER_DASH] }
          ),
        }
      : { show: false },
  };
};

const resolveResampling = (options: SciChartConvertOptionsInput): ResolvedSciChartResamplingOption => {
  const resamplingEnabled = options?.resampling?.enable ?? false;
  const precision = options?.resampling?.precision;

  if (!resamplingEnabled) {
    if (precision == null) {
      return {
        resamplingMode: EResamplingMode.None,
      };
    }

    return {
      resamplingMode: EResamplingMode.None,
      resamplingPrecision: precision,
    };
  }

  return {
    resamplingMode: EResamplingMode.Auto,
    resamplingPrecision: precision ?? SCI_CHART_RESAMPLING_PRECISION_DEFAULT,
  };
};

const resolveOptions = (
  options: SciChartConvertOptionsInput,
  style: SciChartConvertStyleInput
): ResolvedSciChartOptions => ({
  features: resolveFeatures(options, style),
  resampling: resolveResampling(options),
  events: options?.events as ResolvedSciChartOptionsEvents | undefined,
  clipZoomToData: options?.clipZoomToData ?? true,
});

export const toSciChartDefinition = ({
  lines: chartData,
  style,
  options,
}: SciChartConvertInput): ResolvedSciChartDefinition => {
  const resolvedStyles = resolveStyles(style);
  const resolvedSeriesVisibility = resolveSeriesVisibility(
    chartData.length,
    options?.seriesVisibility
  );
  const resolvedOptions = resolveOptions(options, style);

  return {
    data: convertData(chartData, resolvedSeriesVisibility, resolvedStyles),
    shapes: resolveShapes(options.shapes),
    icons: resolveIcons(options.icons, resolvedStyles.defaultStyles.iconColor),
    note: options.note,
    options: resolvedOptions,
    styles: resolvedStyles,
  };
};
