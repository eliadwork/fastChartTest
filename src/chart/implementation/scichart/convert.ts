/**
 * SciChart data and shape conversion.
 * Converts generic ChartData/ChartShape to implementation-ready formats.
 */

import { withOpacity } from '../../../utils/colorUtils';
import {
  DEFAULT_LEGEND_BACKGROUND_COLOR,
  DEFAULT_SHAPE_STYLE,
  DEFAULT_TEXT_COLOR,
  DEFAULT_ZERO_LINE_COLOR,
} from '../../defaultsChartStyles';
import {
  TriggerKey,
  type ChartData,
  type ChartIcon,
  type ChartLineShape,
  type ChartLineStyle,
  type ChartOptions,
  type ChartShape,
  type DashConfig,
} from '../../types';
import type {
  ChartImplementationOptions,
  ChartImplementationProps,
  KeyTriggeredOption,
} from '../implementationProps';

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
  seriesVisibility?: boolean[];
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
  options?: Pick<ChartOptions, 'seriesVisibility'>
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
    seriesVisibility: options?.seriesVisibility,
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

export function convertShapes(shapes: ChartShape[] = []): {
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
      const line = shape as ChartLineShape;
      lines.push({
        color: line.color ?? '#ff0000',
        lineAxis: line.axis,
        lineValue: line.value,
        strokeDashArray: dashToStrokeArray(line.dash),
      });
    }
  }
  return { lines, boxes };
}

export function normalizeShape(
  shape:
    | ChartLineShape
    | {
        color: string;
        lineAxis: 'x' | 'y';
        lineValue: number;
        dash?: DashConfig;
        strokeDashArray?: number[];
      }
): ConvertedShape {
  const toStroke = (d?: DashConfig, arr?: number[]) => dashToStrokeArray(d) ?? arr;
  if ('lineAxis' in shape && 'lineValue' in shape) {
    const x = shape as {
      color: string;
      lineAxis: 'x' | 'y';
      lineValue: number;
      dash?: DashConfig;
      strokeDashArray?: number[];
    };
    return {
      color: x.color,
      lineAxis: x.lineAxis,
      lineValue: x.lineValue,
      strokeDashArray: toStroke(x.dash, x.strokeDashArray),
    };
  }
  const line = shape as ChartLineShape;
  return {
    color: line.color ?? '#ff0000',
    lineAxis: line.axis,
    lineValue: line.value,
    strokeDashArray: dashToStrokeArray(line.dash),
  };
}

const DEFAULT_STRETCH: KeyTriggeredOption = { enable: true, trigger: TriggerKey.rightClick };
const DEFAULT_PAN: KeyTriggeredOption = { enable: true, trigger: TriggerKey.shift };
const DEFAULT_RESAMPLING = { enable: false, precision: 0 };

function applyShapeDefaults(shapes: ChartShape[] = []): ChartShape[] {
  return shapes.map((shape) => {
    if (shape.shape === 'box') return shape;
    const line = shape as ChartLineShape;
    return {
      ...line,
      color: line.color ?? DEFAULT_SHAPE_STYLE.color,
      dash: line.dash ?? DEFAULT_SHAPE_STYLE.dash,
    };
  });
}

/** Internal options with shapes/icons and style-derived options for SciChart. */
export type SciChartConvertedOptions = ChartOptions & {
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  seriesVisibility?: boolean[];
  seriesGroupKeys?: (string | undefined)[];
  chartOnly?: boolean;
  backgroundColor?: string;
  textColor?: string;
  zeroLineColor?: string;
  legendBackgroundColor?: string;
  defaultSeriesColors?: string[];
  defaultStrokeThickness?: number;
  defaultIconColor?: string;
  rolloverStroke?: string;
  rolloverDash?: DashConfig;
  rolloverShow?: boolean;
};

export const toInternalOptions = (
  props: ChartImplementationProps,
  seriesVisibility: boolean[]
): { data: ConvertedData; options: SciChartConvertedOptions } => {
  const { lines: chartData, style, options: opts = {} } = props;
  const opt: ChartImplementationOptions = {
    shapes: opts.shapes,
    icons: opts.icons,
    note: opts.note,
    stretch: {
      enable: opts.stretch?.enable !== false,
      trigger: opts.stretch?.trigger ?? DEFAULT_STRETCH.trigger,
    },
    pan: {
      enable: opts.pan?.enable !== false,
      trigger: opts.pan?.trigger ?? DEFAULT_PAN.trigger,
    },
    resampling: opts.resampling
      ? {
          enable: opts.resampling.enable,
          precision: opts.resampling.precision,
        }
      : DEFAULT_RESAMPLING,
    clipZoomToData: opts.clipZoomToData !== false,
    seriesVisibility,
    seriesGroupKeys: opts.seriesGroupKeys,
    events: opts.events,
  };

  const shapesWithDefaults = applyShapeDefaults(opt.shapes);
  const convertedData = convertData(chartData, { seriesVisibility });

  const backgroundColor =
    style.backgroundColor != null ? withOpacity(style.backgroundColor, 0.2) : undefined;

  const options: SciChartConvertedOptions = {
    chartOnly: style.chartOnly,
    shapes: shapesWithDefaults,
    stretch: opt.stretch,
    pan: opt.pan,
    clipZoomToData: opt.clipZoomToData,
    resampling: opt.resampling,
    backgroundColor,
    textColor: style.textColor ?? DEFAULT_TEXT_COLOR,
    zeroLineColor: style.zeroLineColor ?? DEFAULT_ZERO_LINE_COLOR,
    legendBackgroundColor: style.legendBackgroundColor ?? DEFAULT_LEGEND_BACKGROUND_COLOR,
    defaultSeriesColors: style.defaults?.seriesColors,
    defaultStrokeThickness: style.defaults?.strokeThickness,
    defaultIconColor: style.defaults?.iconColor,
    rolloverStroke: style.rollover.show ? style.rollover.color : undefined,
    rolloverDash: style.rollover.show ? style.rollover.dash : undefined,
    rolloverShow: style.rollover.show,
    icons: opt.icons,
    seriesVisibility,
    seriesGroupKeys:
      opt.seriesGroupKeys ?? convertedData.series.map((series) => series.lineGroupKey),
    events: opt.events,
  };

  return { data: convertedData, options };
};
