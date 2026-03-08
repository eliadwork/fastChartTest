/**
 * Chart implementation props.
 * Every chart implementation receives these same props and converts them internally.
 */

import type {
  ChartData,
  ChartIcon,
  ChartResamplingOption,
  ChartRolloverStyle,
  ChartShape,
  ChartStyle,
  KeyTriggeredOption,
  TriggerKey,
} from '../types';

export type ChartImplementationTriggerKey = TriggerKey;
export type ChartImplementationRolloverStyle = ChartRolloverStyle;
export type ChartImplementationStyle = ChartStyle;
export type { KeyTriggeredOption };

export interface ChartImplementationResampling {
  enable: boolean;
  precision: number;
}

export interface ChartImplementationEvents {
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

export interface ChartImplementationOptionsOverrides {
  note?: string;
  stretch?: KeyTriggeredOption;
  pan?: KeyTriggeredOption;
  resampling?: ChartImplementationResampling | ChartResamplingOption;
  clipZoomToData?: boolean;
  seriesVisibility?: boolean[];
  seriesGroupKeys?: (string | undefined)[];
  events?: ChartImplementationEvents;
}

/** Full options after defaults are applied. Used internally by implementations. */
export interface ChartImplementationOptions {
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  note?: string;
  stretch: KeyTriggeredOption;
  pan: KeyTriggeredOption;
  resampling: ChartImplementationResampling;
  clipZoomToData: boolean;
  seriesVisibility: boolean[];
  seriesGroupKeys?: (string | undefined)[];
  events?: ChartImplementationEvents;
}

/** Internal: options with visibility handlers set by Chart. Used only by implementations. */
export interface ChartImplementationOptionsWithHandlers extends ChartImplementationOptionsOverrides {
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void;
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void;
  onDisableAll?: () => void;
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
  options?: ChartImplementationOptionsWithHandlers;
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
