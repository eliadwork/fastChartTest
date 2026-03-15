import type * as React from 'react';
import type { EResamplingMode } from 'scichart';
import type { DashConfig, TriggerKey } from '../../types';

export interface scichartFullDefinition {
  data: scichartData;
  shapes?: sciChartShape[];
  icons?: sciChartIcon[];
  note?: string;
  options?: SciChartOptions;
  styles?: scichartStyles;
}

// data definition
export interface scichartData {
  series: scichartDataSeries[];
  seriesVisibility: boolean[];
}

export interface scichartDataSeries {
  x: Float64Array;
  y: Float64Array;
  name: string;
  lineGroupKey?: string;
  style?: sciChartLineStyle;
}

export interface sciChartLineStyle {
  color?: string;
  thickness?: number;
  /** Dash config: isDash enables dashed line, steps is the pattern (e.g. [6, 4] for striped). */
  dash?: sciChartDashConfig;
}

export interface sciChartDashConfig {
  isDash: boolean;
  steps?: number[];
}

// shapes definition
export interface sciChartLineShape {
  /** Explicit shape type; omit for shorthand. */
  shape?: 'line';
  color?: string;
  axis: 'x' | 'y';
  value: number;
  dash?: DashConfig;
}

export interface sciChartBoxShape {
  shape: 'box';
  name?: string;
  color: string;
  fill?: string;
  coordinates: {
    x1?: number;
    x2?: number;
    y1?: number;
    y2?: number;
  };
  dash?: DashConfig;
}

export type sciChartShape = sciChartLineShape | sciChartBoxShape;

export type ResolvedSciChartLineShape = Omit<sciChartLineShape, 'shape' | 'color' | 'dash'> & {
  shape: 'line';
  color: string;
  dash: DashConfig;
};

export type ResolvedSciChartBoxShape = sciChartBoxShape;

export type ResolvedSciChartShape = ResolvedSciChartLineShape | ResolvedSciChartBoxShape;

// icons definition
export interface sciChartIcon {
  /** SVG string (preferred, use {{color}} for fill), image URL, or legacy character. */
  iconImage: string;
  location: { x: number; y: number };
  color?: string;
  size?: number;
}

export type ResolvedSciChartIcon = Omit<sciChartIcon, 'color' | 'size'> & {
  color: string;
  size: number;
};

// options definition
export interface SciChartOptions {
  features?: sciChartFeaturesOptions;
  resampling?: sciChartResamplingOption;
  events?: sciChartOptionsEvents;
  clipZoomToData?: boolean;
}

export interface sciChartFeaturesOptions {
  stretch?: featureKeyEnabling;
  pan?: featureKeyEnabling;
  rollover?: sciChartRolloverConfig;
}

export type sciChartResamplingOption =
  | {
      resamplingMode: EResamplingMode.None;
      resamplingPrecision?: number;
    }
  | {
      resamplingMode: Exclude<EResamplingMode, EResamplingMode.None>;
      resamplingPrecision: number;
    };

export interface sciChartOptionsEvents {
  clicks?: sciChartClickEvents;
  keys?: sciChartKeyEvents;
  zoom?: sciChartZoomCallbacks;
  scroll?: (event: WheelEvent) => void;
}
export interface sciChartClickEvents {
  right?: (event: MouseEvent) => void;
  left?: (event: MouseEvent) => void;
  double?: (event: MouseEvent) => void;
  middle?: (event: MouseEvent) => void;
}

export interface sciChartKeyEvents {
  shift?: (event: MouseEvent) => void;
  ctrl?: (event: MouseEvent) => void;
  alt?: (event: MouseEvent) => void;
}
export interface sciChartZoomCallbacks {
  setZoomBack: (fn: () => void) => void;
  setZoomReset: (fn: () => void) => void;
  setCanZoomBack: (can: boolean) => void;
  setPushBeforeReset: (fn: () => void) => void;
  pushBeforeResetRef: React.MutableRefObject<(() => void) | null>;
}

// styles definition
export interface scichartStyles {
  chartOnly: boolean;
  backgroundColor: string;
  textColor: string;
  zeroLineColor: string;
  defaultStyles: scichartDefaultStyles;
}
export interface scichartDefaultStyles {
  seriesColors: string[];
  lineStyles: sciChartLineStyle;
  iconColor: string;
}

export interface sciChartRolloverConfig {
  show: boolean;
  color: string;
  dash: sciChartDashConfig;
}
export interface featureKeyEnabling {
  enable: boolean;
  trigger?: TriggerKey;
}

export type resolvedFeatureKeyEnabling =
  | {
      enable: false;
      trigger?: TriggerKey;
    }
  | {
      enable: true;
      trigger: TriggerKey;
    };

export interface SciChartDataBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  hasValidBounds: boolean;
}

export type ResolvedSciChartDashConfig = Required<Omit<sciChartDashConfig, 'steps'>> & {
  steps: number[];
};

export type ResolvedSciChartLineStyle = Required<Omit<sciChartLineStyle, 'dash'>> & {
  dash: ResolvedSciChartDashConfig;
};

export type ResolvedSciChartDataSeries = Required<
  Omit<scichartDataSeries, 'lineGroupKey' | 'style'>
> &
  Pick<scichartDataSeries, 'lineGroupKey'> & {
    style: ResolvedSciChartLineStyle;
  };

export type ResolvedSciChartData = Required<Omit<scichartData, 'series'>> & {
  series: ResolvedSciChartDataSeries[];
};

export type ResolvedSciChartClickEvents = sciChartClickEvents;

export type ResolvedSciChartKeyEvents = sciChartKeyEvents;

export type ResolvedSciChartZoomCallbacks = sciChartZoomCallbacks;

export interface ResolvedSciChartOptionsEvents {
  clicks?: ResolvedSciChartClickEvents;
  keys?: ResolvedSciChartKeyEvents;
  zoom?: ResolvedSciChartZoomCallbacks;
  scroll?: (event: WheelEvent) => void;
}

export type ResolvedSciChartFeaturesOptions = Required<
  Omit<sciChartFeaturesOptions, 'stretch' | 'pan' | 'rollover'>
> & {
  stretch: resolvedFeatureKeyEnabling;
  pan: resolvedFeatureKeyEnabling;
  rollover:
    | (Required<Omit<sciChartRolloverConfig, 'dash'>> & {
        dash: ResolvedSciChartDashConfig;
      })
    | {
        show: false;
      };
};

export type ResolvedSciChartResamplingOption = sciChartResamplingOption;

export type ResolvedSciChartOptions = Required<
  Omit<SciChartOptions, 'features' | 'resampling' | 'events'>
> & {
  features: ResolvedSciChartFeaturesOptions;
  resampling: ResolvedSciChartResamplingOption;
  events?: ResolvedSciChartOptionsEvents;
};

export type ResolvedScichartDefaultStyles = Required<Omit<scichartDefaultStyles, 'lineStyles'>> & {
  lineStyles: ResolvedSciChartLineStyle;
};

export type ResolvedScichartStyles = Required<Omit<scichartStyles, 'defaultStyles'>> & {
  defaultStyles: ResolvedScichartDefaultStyles;
};

export type ResolvedSciChartDefinition = Required<
  Omit<scichartFullDefinition, 'data' | 'options' | 'styles' | 'note'>
> &
  Pick<scichartFullDefinition, 'note'> & {
    data: ResolvedSciChartData;
    shapes: ResolvedSciChartShape[];
    icons: ResolvedSciChartIcon[];
    options: ResolvedSciChartOptions;
    styles: ResolvedScichartStyles;
  };
