/**
 * SciChart data and shape conversion.
 * Converts generic ChartData/ChartShape to implementation-ready formats.
 */

import { withOpacity } from '../../../utils/colorUtils';
import {
  type ChartData,
  type ChartIcon,
  type ChartLineStyle,
  type ChartOptionsEvents,
  type ChartResamplingOption,
  type ChartShape,
  type DashConfig,
  type KeyTriggeredOption,
} from '../../types';
import type { ChartImplementationProps } from '../implementationProps';

/** Convert DashConfig to SciChart strokeDashArray. Returns undefined for solid lines. */
export const dashToStrokeArray = (dash?: DashConfig): number[] | undefined =>
  dash?.isDash && dash.steps?.length ? dash.steps : undefined;

export interface ConvertedSeries {
  x: Float64Array;
  y: Float64Array;
  name: string;
  lineGroupKey?: string;
  style: ChartLineStyle;
}

export interface ConvertedData {
  series: ConvertedSeries[];
  seriesVisibility: boolean[];
}

export interface ConvertedShape {
  color: string;
  lineAxis: 'x' | 'y';
  lineValue: number;
  strokeDashArray?: number[];
}

export interface ConvertedMarker {
  type: 'marker';
  x: number;
  icon?: string;
}

export function toFloat64Array(arr: ArrayLike<number> | number[]): Float64Array {
  if (Object.prototype.toString.call(arr) === '[object Float64Array]') return arr as Float64Array;
  return new Float64Array(arr);
}

export function convertData(
  data: ChartData,
  options: { seriesVisibility: boolean[] }
): ConvertedData {
  const series: ConvertedSeries[] = data.map((line) => ({
    x: toFloat64Array(line.x),
    y: toFloat64Array(line.y),
    name: line.name,
    lineGroupKey: line.lineGroupKey,
    style: line.style,
  }));
  return {
    series,
    seriesVisibility: options.seriesVisibility,
  };
}

export interface ConvertedBox {
  name?: string;
  color: string;
  fill?: string;
  x1?: number;
  x2?: number;
  y1?: number;
  y2?: number;
  strokeDashArray?: number[];
}

export function convertShapes(shapes: ChartShape[]): {
  lines: ConvertedShape[];
  boxes: ConvertedBox[];
} {
  const lines: ConvertedShape[] = [];
  const boxes: ConvertedBox[] = [];
  for (const shape of shapes) {
    if (shape.shape === 'box') {
      boxes.push({
        name: shape.name,
        color: shape.color,
        fill: shape.fill,
        x1: shape.coordinates.x1,
        x2: shape.coordinates.x2,
        y1: shape.coordinates.y1,
        y2: shape.coordinates.y2,
        strokeDashArray: dashToStrokeArray(shape.dash),
      });
    } else if (shape.shape === 'line' || ('axis' in shape && 'value' in shape)) {
      if (shape.color == null) {
        throw new Error('Line shape color must be resolved before SciChart conversion.');
      }
      lines.push({
        color: shape.color,
        lineAxis: shape.axis,
        lineValue: shape.value,
        strokeDashArray: dashToStrokeArray(shape.dash),
      });
    }
  }
  return { lines, boxes };
}

/** Internal options with style and interaction contracts already resolved by facade resolvers. */
export interface SciChartConvertedOptions {
  note?: string;
  shapes: ChartShape[];
  icons: ChartIcon[];
  stretch: KeyTriggeredOption;
  pan: KeyTriggeredOption;
  clipZoomToData: boolean;
  resampling: ChartResamplingOption;
  seriesVisibility: boolean[];
  seriesGroupKeys: (string | undefined)[];
  events?: ChartOptionsEvents;
  chartOnly: boolean;
  backgroundColor: string;
  textColor: string;
  zeroLineColor: string;
  legendBackgroundColor: string;
  defaultSeriesColors: string[];
  defaultStrokeThickness: number;
  defaultIconColor: string;
  rolloverStroke: string;
  rolloverDash: DashConfig;
  rolloverShow: boolean;
}

export const toInternalOptions = ({
  lines: chartData,
  style,
  options: resolvedOptions,
}: Pick<ChartImplementationProps, 'lines' | 'style' | 'options'>): {
  data: ConvertedData;
  options: SciChartConvertedOptions;
} => {
  const convertedData = convertData(chartData, {
    seriesVisibility: resolvedOptions.seriesVisibility,
  });
  const backgroundColor = withOpacity(style.backgroundColor, 0.2);
  const styleDefaults = style.defaults;

  if (style.zeroLineColor == null || style.legendBackgroundColor == null || styleDefaults == null) {
    throw new Error('Chart style must be resolved before SciChart conversion.');
  }
  if (
    styleDefaults.seriesColors == null ||
    styleDefaults.strokeThickness == null ||
    styleDefaults.iconColor == null
  ) {
    throw new Error('Chart style defaults must be resolved before SciChart conversion.');
  }

  const convertedOptions: SciChartConvertedOptions = {
    note: resolvedOptions.note,
    chartOnly: style.chartOnly,
    shapes: resolvedOptions.shapes,
    stretch: resolvedOptions.stretch,
    pan: resolvedOptions.pan,
    clipZoomToData: resolvedOptions.clipZoomToData,
    resampling: resolvedOptions.resampling,
    backgroundColor,
    textColor: style.textColor,
    zeroLineColor: style.zeroLineColor,
    legendBackgroundColor: style.legendBackgroundColor,
    defaultSeriesColors: styleDefaults.seriesColors,
    defaultStrokeThickness: styleDefaults.strokeThickness,
    defaultIconColor: styleDefaults.iconColor,
    rolloverStroke: style.rollover.color,
    rolloverDash: style.rollover.dash,
    rolloverShow: style.rollover.show,
    icons: resolvedOptions.icons,
    seriesVisibility: resolvedOptions.seriesVisibility,
    seriesGroupKeys: resolvedOptions.seriesGroupKeys,
    events: resolvedOptions.events,
  };

  return { data: convertedData, options: convertedOptions };
};
