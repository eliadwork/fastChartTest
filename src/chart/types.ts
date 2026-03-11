/**
 * Generic chart types - library-agnostic.
 * No implementation-specific references.
 */

export interface ChartLineStyle {
  color?: string;
  thickness?: number;
  /** Dash config: isDash enables dashed line, steps is the pattern (e.g. [6, 4] for striped). */
  dash?: DashConfig;
  /** When false, series is excluded from middle-click handler context (e.g. seriesBindable). Default: true. */
  bindable?: boolean;
}

export interface ChartRolloverStyle {
  show: boolean;
  color: string;
  dash: DashConfig;
}

/** Chart style passed to Chart and implementations. */
export interface ChartStyle {
  backgroundColor: string;
  rollover: ChartRolloverStyle;
  textColor: string;
  defaults?: {
    /** Default colors for auto-styled series. */
    seriesColors?: string[];
    /** Default stroke thickness for auto-styled series. */
    strokeThickness?: number;
    /** Fallback icon color when icon.color is omitted. */
    iconColor?: string;
  };
  legendBackgroundColor?: string;
  zeroLineColor?: string;
  /** When true, only the chart is visible – no header, legend, or buttons. */
  chartOnly: boolean;
}

/** One line/series in the chart. Each line has its own x, y, name, optional group key, and style. */
export interface ChartDataSeries {
  x: number[] | ArrayLike<number>;
  y: number[] | ArrayLike<number>;
  name: string;
  lineGroupKey?: string;
  style: ChartLineStyle;
}

/** Chart data: array of lines, each with its own x, y, name, lineGroupKey, and style. */
export type ChartData = ChartDataSeries[];

export interface ChartLineShape {
  /** Explicit shape type; omit for shorthand. */
  shape?: 'line';
  color?: string;
  axis: 'x' | 'y';
  value: number;
  dash?: DashConfig;
}

export interface ChartBoxShape {
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

export type ChartShape = ChartLineShape | ChartBoxShape;

/** Unified dash config: isDash enables dashed line, steps is the pattern (e.g. [8, 4]). */
export interface DashConfig {
  isDash: boolean;
  steps: number[];
}

export interface ChartMarkerShape {
  type: 'marker';
  x: number;
  icon?: string;
  color?: string;
}

export const TriggerKey = {
  rightClick: 'rightClick',
  leftClick: 'leftClick',
  shift: 'shift',
  ctrl: 'ctrl',
  alt: 'alt',
} as const;

export type TriggerKey = (typeof TriggerKey)[keyof typeof TriggerKey];

export interface KeyTriggeredOption {
  enable: boolean;
  trigger: TriggerKey;
}

export interface ChartResamplingOption {
  enable: boolean;
  precision: number;
}

export interface ChartOptionsEvents {
  onrightclick?: (event: MouseEvent) => void;
  onleftclick?: (event: MouseEvent) => void;
  onshiftclick?: (event: MouseEvent) => void;
  onctrlclick?: (event: MouseEvent) => void;
  onaltclick?: (event: MouseEvent) => void;
  onscroll?: (event: WheelEvent) => void;
  ondoubleclick?: (event: MouseEvent) => void;
  onzoom?: (event: MouseEvent) => void;
  onzoomback?: () => void;
  onzoomreset?: () => void;
  onmiddleclick?: (event: MouseEvent) => void;
}

export interface ChartFeatureToggleOption {
  enabled?: boolean;
}

export interface ChartFeaturesOptions {
  legend?: ChartFeatureToggleOption;
  toolbar?: ChartFeatureToggleOption;
  [featureName: string]: ChartFeatureToggleOption | undefined;
}

export interface ChartIcon {
  /** SVG string (preferred, use {{color}} for fill), image URL, or legacy character. */
  iconImage: string;
  location: { x: number; y: number };
  color?: string;
}

export interface ChartOptions {
  howToUseAdditional?: string;
  note?: string;
  features?: ChartFeaturesOptions;
  /** Default when omitted: { enable: true, trigger: 'rightClick' }. Omit trigger to use default. */
  stretch?: { enable: boolean; trigger?: TriggerKey };
  /** Default when omitted: { enable: true, trigger: 'shift' }. Omit trigger to use default. */
  pan?: { enable: boolean; trigger?: TriggerKey };
  /** Default when omitted: { enable: false, precision: 0 }. */
  resampling?: ChartResamplingOption;
  /** Default when omitted: true. */
  seriesVisibility?: boolean[];
  /** Group keys for legend. When omitted, derived from data lines' lineGroupKey. */
  seriesGroupKeys?: (string | undefined)[];
  events?: ChartOptionsEvents;
  clipZoomToData?: boolean;
}
