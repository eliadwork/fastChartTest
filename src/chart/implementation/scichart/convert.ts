/**
 * SciChart definition resolver.
 * Adapts resolved generic chart definition into SciChart runtime definition.
 * Only runtime-specific adaptation is performed here.
 */

import { EResamplingMode } from 'scichart';

import type { ResolvedChartDefinition } from '../../chartImplementationContracts';
import type { DashConfig } from '../../types';
import type {
  ResolvedSciChartData,
  ResolvedSciChartDefinition,
  ResolvedSciChartResamplingOption,
} from './scichartOptions';

/** Convert DashConfig to SciChart strokeDashArray. Returns undefined for solid lines. */
export const dashToStrokeArray = (dash?: DashConfig): number[] | undefined =>
  dash?.isDash && dash.steps?.length ? dash.steps : undefined;

const toFloat64Array = (arr: ArrayLike<number> | number[]): Float64Array => {
  if (Object.prototype.toString.call(arr) === '[object Float64Array]') {
    return arr as Float64Array;
  }

  return new Float64Array(arr);
};

const resolveSciChartData = (data: ResolvedChartDefinition['data']): ResolvedSciChartData => ({
  series: data.series.map((series) => ({
    ...series,
    x: toFloat64Array(series.x),
    y: toFloat64Array(series.y),
  })),
  seriesVisibility: [...data.seriesVisibility],
});

const resolveSciChartResampling = (
  resampling: ResolvedChartDefinition['options']['resampling']
): ResolvedSciChartResamplingOption => ({
  resamplingMode: resampling.enable ? EResamplingMode.Auto : EResamplingMode.None,
  resamplingPrecision: resampling.precision,
});

export const resolveSciChartDefinition = (
  definition: ResolvedChartDefinition
): ResolvedSciChartDefinition => ({
  ...definition,
  data: resolveSciChartData(definition.data),
  options: {
    ...definition.options,
    resampling: resolveSciChartResampling(definition.options.resampling),
    events: definition.options.events,
  },
});

// Backward-compatible alias during rename migration.
export const toSciChartDefinition = resolveSciChartDefinition;
