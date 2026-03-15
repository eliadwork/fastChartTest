import type { EResamplingMode } from 'scichart';

import type {
  ChartDefinition,
  ChartDefinitionBoxShape,
  ChartDefinitionDashConfig,
  ChartDefinitionData,
  ChartDefinitionDataSeries,
  ChartDefinitionDefaultStyles,
  ChartDefinitionEvents,
  ChartDefinitionFeatures,
  ChartDefinitionIcon,
  ChartDefinitionLineShape,
  ChartDefinitionLineStyle,
  ChartDefinitionOptions,
  ChartDefinitionShape,
  ChartDefinitionStyles,
  ChartZoomCallbacks,
  ResolvedChartDefinition,
  ResolvedChartDefinitionBoxShape,
  ResolvedChartDefinitionDashConfig,
  ResolvedChartDefinitionData,
  ResolvedChartDefinitionDataSeries,
  ResolvedChartDefinitionDefaultStyles,
  ResolvedChartDefinitionEvents,
  ResolvedChartDefinitionFeatureKeyEnabling,
  ResolvedChartDefinitionFeatures,
  ResolvedChartDefinitionIcon,
  ResolvedChartDefinitionLineShape,
  ResolvedChartDefinitionLineStyle,
  ResolvedChartDefinitionOptions,
  ResolvedChartDefinitionShape,
  ResolvedChartDefinitionStyles,
} from '../../chartImplementationContracts';

export type scichartFullDefinition = ChartDefinition;

export type scichartData = ChartDefinitionData;
export type scichartDataSeries = ChartDefinitionDataSeries;
export type sciChartLineStyle = ChartDefinitionLineStyle;
export type sciChartDashConfig = ChartDefinitionDashConfig;

export type sciChartLineShape = ChartDefinitionLineShape;
export type sciChartBoxShape = ChartDefinitionBoxShape;
export type sciChartShape = ChartDefinitionShape;

export type sciChartIcon = ChartDefinitionIcon;

export type SciChartOptions = ChartDefinitionOptions;
export type sciChartFeaturesOptions = ChartDefinitionFeatures;
export type sciChartOptionsEvents = ChartDefinitionEvents;
export type sciChartZoomCallbacks = ChartZoomCallbacks;

export type scichartStyles = ChartDefinitionStyles;
export type scichartDefaultStyles = ChartDefinitionDefaultStyles;

export interface SciChartDataBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  hasValidBounds: boolean;
}

export type ResolvedSciChartDashConfig = ResolvedChartDefinitionDashConfig;
export type ResolvedSciChartLineStyle = ResolvedChartDefinitionLineStyle;

export type ResolvedSciChartDataSeries = Omit<ResolvedChartDefinitionDataSeries, 'x' | 'y'> & {
  x: Float64Array;
  y: Float64Array;
};

export type ResolvedSciChartData = Omit<ResolvedChartDefinitionData, 'series'> & {
  series: ResolvedSciChartDataSeries[];
};

export type ResolvedSciChartLineShape = ResolvedChartDefinitionLineShape;
export type ResolvedSciChartBoxShape = ResolvedChartDefinitionBoxShape;
export type ResolvedSciChartShape = ResolvedChartDefinitionShape;

export type ResolvedSciChartIcon = ResolvedChartDefinitionIcon;

export type ResolvedSciChartClickEvents = NonNullable<ResolvedChartDefinitionEvents['clicks']>;
export type ResolvedSciChartKeyEvents = NonNullable<ResolvedChartDefinitionEvents['keys']>;
export type ResolvedSciChartZoomCallbacks = ChartZoomCallbacks;

export interface ResolvedSciChartOptionsEvents {
  clicks?: ResolvedSciChartClickEvents;
  keys?: ResolvedSciChartKeyEvents;
  zoom?: ResolvedSciChartZoomCallbacks;
  scroll?: (event: WheelEvent) => void;
}

export type resolvedFeatureKeyEnabling = ResolvedChartDefinitionFeatureKeyEnabling;
export type ResolvedSciChartFeaturesOptions = ResolvedChartDefinitionFeatures;

export type ResolvedSciChartResamplingOption =
  | {
      resamplingMode: EResamplingMode.None;
      resamplingPrecision?: number;
    }
  | {
      resamplingMode: Exclude<EResamplingMode, EResamplingMode.None>;
      resamplingPrecision: number;
    };

export type ResolvedSciChartOptions = Omit<
  ResolvedChartDefinitionOptions,
  'resampling' | 'events'
> & {
  resampling: ResolvedSciChartResamplingOption;
  events?: ResolvedSciChartOptionsEvents;
};

export type ResolvedScichartDefaultStyles = ResolvedChartDefinitionDefaultStyles;
export type ResolvedScichartStyles = ResolvedChartDefinitionStyles;

export type ResolvedSciChartDefinition = Omit<
  ResolvedChartDefinition,
  'data' | 'options' | 'styles'
> & {
  data: ResolvedSciChartData;
  options: ResolvedSciChartOptions;
  styles: ResolvedScichartStyles;
};
