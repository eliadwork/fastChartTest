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
  defaultChartLineStyles?: ChartLineStyle;
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

export type TriggerKey = 'rightClick' | 'leftClick' | 'shift' | 'ctrl' | 'alt';

export type ModifierKey = 'Shift' | 'Ctrl' | 'Alt' | 'rightClick' | 'leftClick';

export type StretchTrigger = ModifierKey | 'rightClick' | 'leftClick';

export interface KeyTriggeredOption {
  enable: boolean;
  trigger: TriggerKey;
}

/** Input form: trigger is optional (defaults: stretch=rightClick, pan=shift). */
export interface KeyTriggeredOptionInput {
  enable: boolean;
  trigger?: TriggerKey;
}

export interface ChartResamplingOption {
  enable: boolean;
  precision: number;
}

/** Augmented MouseEvent with chart coordinates. Used internally when handler type is (event: MouseEvent) => void. */
export interface ChartMiddleClickEvent extends MouseEvent {
  xValue: number;
  yValue: number;
  getSeriesVisibility?: () => boolean[];
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

export interface ChartIcon {
  /** SVG string (preferred, use {{color}} for fill), image URL, or legacy character. */
  iconImage: string;
  location: { x: number; y: number };
  color?: string;
}

export interface ChartOptions {
  note?: string;
  /** Default when omitted: { enable: true, trigger: 'rightClick' }. Omit trigger to use default. */
  stretch?: KeyTriggeredOptionInput;
  /** Default when omitted: { enable: true, trigger: 'shift' }. Omit trigger to use default. */
  pan?: KeyTriggeredOptionInput;
  /** Default when omitted: { enable: false, precision: 0 }. */
  resampling?: ChartResamplingOption;
  /** Default when omitted: true. */
  clipZoomToData?: boolean;
  seriesVisibility?: boolean[];
  seriesGroupKeys?: (string | undefined)[];
  events?: ChartOptionsEvents;
  /** When true, hide legend and show only the chart surface. */
  chartOnly?: boolean;
  backgroundColor?: string;
  textColor?: string;
  zeroLineColor?: string;
  legendBackgroundColor?: string;
  defaultSeriesColors?: string[];
  defaultStrokeThickness?: number;
  rolloverStroke?: string;
  rolloverDash?: DashConfig;
  rolloverShow?: boolean;
}
