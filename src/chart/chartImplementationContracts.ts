/**
 * Generic chart implementation contracts.
 * These contracts are library-agnostic and can be consumed by any chart implementation.
 */

import type {
  ChartDataSeries,
  ChartBoxShape,
  ChartLineShape,
  ChartIcon,
  ChartOptions,
  ChartOptionsClickEvents,
  ChartOptionsKeyEvents,
  ResolvedChartOptionsEvents,
  ChartResamplingOption,
  DashConfig,
  ChartRolloverStyle,
  ChartStyle,
  KeyTriggeredOption,
  ResolvedChartShape,
  TriggerKey,
} from './types';

export type ChartImplementationTriggerKey = TriggerKey;
export type ChartImplementationRolloverStyle = ChartRolloverStyle;
export type ChartImplementationStyle = ChartStyle;
export type { KeyTriggeredOption };

export interface ChartImplementationResampling {
  enable: boolean;
  precision: number;
}

export type ChartImplementationEvents = ResolvedChartOptionsEvents;
export type ChartDefinitionResampling = ChartImplementationResampling;
export type ChartDefinitionDashConfig = DashConfig;
export type ChartDefinitionRollover = ChartRolloverStyle;

export interface ChartDefinitionLineStyle {
  color?: string;
  thickness?: number;
  dash?: ChartDefinitionDashConfig;
  bindable?: boolean;
}

export interface ChartDefinitionDataSeries {
  x: ChartDataSeries['x'];
  y: ChartDataSeries['y'];
  name: string;
  lineGroupKey?: string;
  style?: ChartDefinitionLineStyle;
}

export interface ChartDefinitionData {
  series: ChartDefinitionDataSeries[];
  seriesVisibility: boolean[];
}

export type ChartDefinitionLineShape = ChartLineShape;

export type ChartDefinitionBoxShape = ChartBoxShape;

export type ChartDefinitionShape = ChartDefinitionLineShape | ChartDefinitionBoxShape;

export type ChartDefinitionIcon = ChartIcon;

export interface ChartDefinitionFeatureKeyEnabling {
  enable: boolean;
  trigger?: TriggerKey;
}

export interface ChartDefinitionFeatures {
  stretch?: ChartDefinitionFeatureKeyEnabling;
  pan?: ChartDefinitionFeatureKeyEnabling;
  rollover?: ChartDefinitionRollover;
}

export interface ChartDefinitionEvents {
  clicks?: ChartOptionsClickEvents;
  keys?: ChartOptionsKeyEvents;
  zoom?: ChartZoomCallbacks;
  scroll?: (event: WheelEvent) => void;
}

export interface ChartDefinitionOptions {
  features?: ChartDefinitionFeatures;
  resampling?: ChartDefinitionResampling;
  events?: ChartDefinitionEvents;
  clipZoomToData?: boolean;
}

export interface ChartDefinitionDefaultStyles {
  seriesColors: string[];
  lineStyles: ChartDefinitionLineStyle;
  iconColor: string;
}

export interface ChartDefinitionStyles {
  chartOnly: boolean;
  backgroundColor: string;
  textColor: string;
  zeroLineColor: string;
  defaultStyles: ChartDefinitionDefaultStyles;
}

export interface ChartDefinition {
  data: ChartDefinitionData;
  shapes?: ChartDefinitionShape[];
  icons?: ChartDefinitionIcon[];
  note?: string;
  options?: ChartDefinitionOptions;
  styles?: ChartDefinitionStyles;
}

export type ResolvedChartDefinitionDashConfig = Required<
  Omit<ChartDefinitionDashConfig, 'steps'>
> & {
  steps: number[];
};

export type ResolvedChartDefinitionLineStyle = Required<
  Omit<ChartDefinitionLineStyle, 'dash'>
> & {
  dash: ResolvedChartDefinitionDashConfig;
};

export type ResolvedChartDefinitionDataSeries = Required<
  Omit<ChartDefinitionDataSeries, 'lineGroupKey' | 'style'>
> &
  Pick<ChartDefinitionDataSeries, 'lineGroupKey'> & {
    style: ResolvedChartDefinitionLineStyle;
  };

export type ResolvedChartDefinitionData = Required<Omit<ChartDefinitionData, 'series'>> & {
  series: ResolvedChartDefinitionDataSeries[];
};

export type ResolvedChartDefinitionLineShape = Omit<
  ChartDefinitionLineShape,
  'shape' | 'color' | 'dash'
> & {
  shape: 'line';
  color: string;
  dash: DashConfig;
};

export type ResolvedChartDefinitionBoxShape = ChartDefinitionBoxShape;

export type ResolvedChartDefinitionShape =
  | ResolvedChartDefinitionLineShape
  | ResolvedChartDefinitionBoxShape;

export type ResolvedChartDefinitionIcon = Omit<ChartDefinitionIcon, 'color' | 'size'> & {
  color: string;
  size: number;
};

export type ResolvedChartDefinitionFeatureKeyEnabling =
  | {
      enable: false;
      trigger?: TriggerKey;
    }
  | {
      enable: true;
      trigger: TriggerKey;
    };

export type ResolvedChartDefinitionFeatures = Required<
  Omit<ChartDefinitionFeatures, 'stretch' | 'pan' | 'rollover'>
> & {
  stretch: ResolvedChartDefinitionFeatureKeyEnabling;
  pan: ResolvedChartDefinitionFeatureKeyEnabling;
  rollover:
    | (Required<Omit<ChartDefinitionRollover, 'dash'>> & {
        dash: ResolvedChartDefinitionDashConfig;
      })
    | {
        show: false;
      };
};

export type ResolvedChartDefinitionResampling = ChartDefinitionResampling;

export interface ResolvedChartDefinitionEvents {
  clicks?: ChartOptionsClickEvents;
  keys?: ChartOptionsKeyEvents;
  zoom?: ChartZoomCallbacks;
  scroll?: (event: WheelEvent) => void;
}

export type ResolvedChartDefinitionOptions = Required<
  Omit<ChartDefinitionOptions, 'features' | 'resampling' | 'events'>
> & {
  features: ResolvedChartDefinitionFeatures;
  resampling: ResolvedChartDefinitionResampling;
  events?: ResolvedChartDefinitionEvents;
};

export type ResolvedChartDefinitionDefaultStyles = Required<
  Omit<ChartDefinitionDefaultStyles, 'lineStyles'>
> & {
  lineStyles: ResolvedChartDefinitionLineStyle;
};

export type ResolvedChartDefinitionStyles = Required<
  Omit<ChartDefinitionStyles, 'defaultStyles'>
> & {
  defaultStyles: ResolvedChartDefinitionDefaultStyles;
};

export type ResolvedChartDefinition = Required<
  Omit<ChartDefinition, 'data' | 'options' | 'styles' | 'note'>
> &
  Pick<ChartDefinition, 'note'> & {
    data: ResolvedChartDefinitionData;
    shapes: ResolvedChartDefinitionShape[];
    icons: ResolvedChartDefinitionIcon[];
    options: ResolvedChartDefinitionOptions;
    styles: ResolvedChartDefinitionStyles;
  };

export interface ChartImplementationOptionsOverrides {
  note?: ChartOptions['note'];
  stretch?: ChartOptions['stretch'];
  pan?: ChartOptions['pan'];
  resampling?: ChartImplementationResampling | ChartResamplingOption;
  clipZoomToData?: ChartOptions['clipZoomToData'];
  seriesVisibility?: ChartOptions['seriesVisibility'];
  seriesGroupKeys?: ChartOptions['seriesGroupKeys'];
  events?: ChartImplementationEvents;
}

/** Full options after defaults are applied. Used internally by implementations. */
export interface ChartImplementationOptions {
  shapes: ResolvedChartShape[];
  icons: ChartIcon[];
  note?: string;
  stretch: KeyTriggeredOption;
  pan: KeyTriggeredOption;
  resampling: ChartImplementationResampling;
  clipZoomToData: boolean;
  seriesVisibility: boolean[];
  seriesGroupKeys: (string | undefined)[];
  events?: ChartImplementationEvents;
}

/** Internal: options with visibility handlers set by Chart. Used only by implementations. */
export interface ChartImplementationOptionsWithHandlers extends ChartImplementationOptions {
  onSeriesVisibilityChange: (index: number, visible: boolean) => void;
  onSeriesVisibilityGroupChange: (indices: number[], visible: boolean) => void;
  onDisableAll: () => void;
}

export interface ChartZoomCallbacks {
  setZoomBack: (fn: () => void) => void;
  setZoomReset: (fn: () => void) => void;
  setCanZoomBack: (can: boolean) => void;
  setPushBeforeReset: (fn: () => void) => void;
  pushBeforeResetRef: React.MutableRefObject<(() => void) | null>;
}

export interface ChartImplementationProps {
  chartId?: string;
  definition: ResolvedChartDefinition;
  /** CSS style for the wrapper container */
  containerStyle?: React.CSSProperties;
  /**
   * Optional overlay slot (e.g. legend) – rendered inside the chart surface.
   * Parent provides this.
   */
  overlaySlot?: React.ReactNode;
  /** When true, show loader instead of chart. */
  loading?: boolean;
}
