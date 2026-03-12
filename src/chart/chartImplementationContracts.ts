/**
 * Generic chart implementation contracts.
 * These contracts are library-agnostic and can be consumed by any chart implementation.
 */

import type {
  ChartData,
  ChartIcon,
  ChartOptions,
  ResolvedChartOptionsEvents,
  ChartResamplingOption,
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
  lines: ChartData;
  style: ChartImplementationStyle;
  options: ChartImplementationOptionsWithHandlers;
  /** Callbacks for zoom back/reset. When provided, toolbar uses local state instead of global stores. */
  zoomCallbacks?: ChartZoomCallbacks;
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
