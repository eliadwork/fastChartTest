import {
  CHART_RESAMPLING_PRECISION_DEFAULT,
  CHART_RESAMPLING_PRECISION_OFF,
} from '../chartConstants';
import { DEFAULT_SHAPE_STYLE } from '../defaultsChartStyles';
import type {
  ChartImplementationOptions,
  ChartImplementationOptionsWithHandlers,
  ResolvedChartDefinition,
  ResolvedChartDefinitionData,
  ResolvedChartDefinitionDataSeries,
  ResolvedChartDefinitionDashConfig,
  ResolvedChartDefinitionIcon,
  ResolvedChartDefinitionLineStyle,
  ResolvedChartDefinitionShape,
} from '../chartImplementationContracts';
import type {
  ChartData,
  ChartDataSeries,
  ChartFeatureToggleOption,
  ChartFeaturesOptions,
  ChartIcon,
  ChartOptions,
  ChartOptionsEvents,
  ChartResamplingOption,
  DashConfig,
  ResolvedChartOptionsEvents,
  ResolvedChartShape,
  ChartShape,
  ChartStyle,
  KeyTriggeredOption,
} from '../types';
import { resolveChartDataSeriesStyle } from './resolveChartDataSeriesStyle';

const EMPTY_CHART_DATA: ChartData = [];
const EMPTY_CHART_OPTIONS: ChartOptions = {};
const EMPTY_CHART_SHAPES: ResolvedChartShape[] = [];
const EMPTY_CHART_ICONS: ChartIcon[] = [];
const DEFAULT_ICON_SIZE = 1;
const DEFAULT_ICON_COLOR = '#3388ff';
const DEFAULT_ZERO_LINE_COLOR = '#ffffff';

const DEFAULT_STRETCH: KeyTriggeredOption = { enable: true, trigger: 'rightClick' };
const DEFAULT_PAN: KeyTriggeredOption = { enable: true, trigger: 'shift' };
const DEFAULT_RESAMPLING: ChartResamplingOption = {
  enable: false,
  precision: CHART_RESAMPLING_PRECISION_OFF,
};
const createSolidDashConfig = (): DashConfig => ({ isDash: false, steps: [] });
const resolveDashConfig = (dash?: DashConfig): ResolvedChartDefinitionDashConfig => ({
  isDash: dash?.isDash ?? false,
  steps: dash?.steps == null ? [] : [...dash.steps],
});

export interface ResolvedChartFeatureToggleOption extends ChartFeatureToggleOption {
  enabled: boolean;
}

export type ResolvedChartFeaturesOptions = Omit<ChartFeaturesOptions, 'legend' | 'toolbar'> & {
  legend: ResolvedChartFeatureToggleOption;
  toolbar: ResolvedChartFeatureToggleOption;
};

export interface ResolvedChartOptions
  extends Omit<
    ChartOptions,
    'features' | 'stretch' | 'pan' | 'resampling' | 'clipZoomToData' | 'events'
  > {
  features: ResolvedChartFeaturesOptions;
  stretch: KeyTriggeredOption;
  pan: KeyTriggeredOption;
  resampling: ChartResamplingOption;
  clipZoomToData: boolean;
  events?: ResolvedChartOptionsEvents;
}

export interface ResolveChartImplementationOptionsParams {
  data: ChartData;
  options: ResolvedChartOptions;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  seriesVisibility: boolean[];
  handleSeriesVisibilityChange: (seriesIndex: number, isVisible: boolean) => void;
  handleSeriesVisibilityGroupChange: (seriesIndices: number[], isVisible: boolean) => void;
  handleToggleAllSeriesVisibility: () => void;
}

export interface ResolveChartDefinitionParams {
  data: ChartData;
  options: ResolvedChartOptions;
  style: ChartStyle;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  seriesVisibility: boolean[];
}

const resolveFeatureToggle = (
  option?: ChartFeatureToggleOption
): ResolvedChartFeatureToggleOption => ({
  enabled: option?.enabled !== false,
});

const resolveChartEvents = (events?: ChartOptionsEvents): ResolvedChartOptionsEvents | undefined => {
  if (events == null) {
    return undefined;
  }

  const clicks =
    events.onrightclick != null ||
    events.onleftclick != null ||
    events.ondoubleclick != null ||
    events.onmiddleclick != null
      ? {
          right: events.onrightclick,
          left: events.onleftclick,
          double: events.ondoubleclick,
          middle: events.onmiddleclick,
        }
      : undefined;

  const keys =
    events.onshiftclick != null || events.onctrlclick != null || events.onaltclick != null
      ? {
          shift: events.onshiftclick,
          ctrl: events.onctrlclick,
          alt: events.onaltclick,
        }
      : undefined;

  const scroll = events.onscroll;
  if (clicks == null && keys == null && scroll == null) {
    return undefined;
  }

  return {
    clicks,
    keys,
    scroll,
  };
};

const resolveChartShapes = (shapes?: ChartShape[]): ResolvedChartShape[] => {
  if (shapes == null || shapes.length === 0) {
    return EMPTY_CHART_SHAPES;
  }

  return shapes.map((shape) => {
    if (shape.shape === 'box') {
      return shape;
    }

    return {
      ...shape,
      shape: 'line',
      color: shape.color ?? DEFAULT_SHAPE_STYLE.color ?? '#ff0000',
      dash: shape.dash ?? createSolidDashConfig(),
    };
  });
};

const resolveChartIcons = (
  icons: ChartIcon[] | undefined,
  defaultColor: string
): ResolvedChartDefinitionIcon[] => {
  if (icons == null || icons.length === 0) {
    return [];
  }

  return icons.map((icon) => ({
    iconImage: icon.iconImage,
    location: icon.location,
    color: icon.color ?? defaultColor,
    size: icon.size ?? DEFAULT_ICON_SIZE,
  }));
};

const resolveChartDefaultLineStyle = (style: ChartStyle): ResolvedChartDefinitionLineStyle => ({
  bindable: true,
  color: style.defaults?.seriesColors?.[0] ?? DEFAULT_SHAPE_STYLE.color ?? '#ff0000',
  thickness: style.defaults?.strokeThickness ?? 0,
  dash: resolveDashConfig(),
});

const resolveChartDefinitionSeriesStyle = (
  style: ChartDataSeries['style'],
  defaultLineStyle: ResolvedChartDefinitionLineStyle
): ResolvedChartDefinitionLineStyle => ({
  bindable: style.bindable ?? defaultLineStyle.bindable,
  color: style.color ?? defaultLineStyle.color,
  thickness: style.thickness ?? defaultLineStyle.thickness,
  dash: resolveDashConfig(style.dash ?? defaultLineStyle.dash),
});

const resolveChartDefinitionData = (
  data: ChartData,
  seriesVisibility: boolean[],
  style: ChartStyle
): ResolvedChartDefinitionData => {
  const defaultLineStyle = resolveChartDefaultLineStyle(style);

  const series: ResolvedChartDefinitionDataSeries[] = data.map((line) => ({
    x: line.x,
    y: line.y,
    name: line.name,
    lineGroupKey: line.lineGroupKey,
    style: resolveChartDefinitionSeriesStyle(line.style, defaultLineStyle),
  }));

  return {
    series,
    seriesVisibility: series.map((_, index) => seriesVisibility[index] ?? true),
  };
};

export const resolveChartData = (
  data: ChartData | null,
  chartStyle: ChartStyle,
  defaultLineColor?: string
): ChartData => {
  const chartData = data ?? EMPTY_CHART_DATA;
  if (chartData.length === 0) {
    return EMPTY_CHART_DATA;
  }

  const seriesColors = chartStyle.defaults?.seriesColors ?? [];
  const defaultStrokeThickness = chartStyle.defaults?.strokeThickness ?? 0;
  const fallbackLineColor = DEFAULT_SHAPE_STYLE.color;

  return chartData.map((line, index) => {
    const fallbackSeriesColor = seriesColors[index % seriesColors.length];
    const resolvedDefaultColor = defaultLineColor ?? fallbackSeriesColor ?? fallbackLineColor;

    return {
      ...line,
      style: resolveChartDataSeriesStyle({
        style: line.style,
        defaultColor: resolvedDefaultColor,
        defaultThickness: defaultStrokeThickness,
      }),
    };
  });
};

export const resolveChartOptions = (options?: ChartOptions): ResolvedChartOptions => {
  const chartOptions = options ?? EMPTY_CHART_OPTIONS;
  const rawFeatures = chartOptions.features ?? {};
  const resolvedFeaturesEntries = Object.entries(rawFeatures).map(([featureName, featureConfig]) => [
    featureName,
    resolveFeatureToggle(featureConfig),
  ]);

  const features: ResolvedChartFeaturesOptions = {
    ...Object.fromEntries(resolvedFeaturesEntries),
    legend: resolveFeatureToggle(rawFeatures.legend),
    toolbar: resolveFeatureToggle(rawFeatures.toolbar),
  };

  return {
    ...chartOptions,
    features,
    stretch: {
      enable: chartOptions.stretch?.enable ?? DEFAULT_STRETCH.enable,
      trigger: chartOptions.stretch?.trigger ?? DEFAULT_STRETCH.trigger,
    },
    pan: {
      enable: chartOptions.pan?.enable ?? DEFAULT_PAN.enable,
      trigger: chartOptions.pan?.trigger ?? DEFAULT_PAN.trigger,
    },
    resampling:
      chartOptions.resampling != null
        ? {
            enable: chartOptions.resampling.enable,
            precision:
              chartOptions.resampling.precision ??
              (chartOptions.resampling.enable
                ? CHART_RESAMPLING_PRECISION_DEFAULT
                : CHART_RESAMPLING_PRECISION_OFF),
          }
        : DEFAULT_RESAMPLING,
    clipZoomToData: chartOptions.clipZoomToData ?? true,
    events: resolveChartEvents(chartOptions.events),
  };
};

export const resolveChartImplementationOptions = ({
  data,
  options,
  shapes,
  icons,
  seriesVisibility,
  handleSeriesVisibilityChange,
  handleSeriesVisibilityGroupChange,
  handleToggleAllSeriesVisibility,
}: ResolveChartImplementationOptionsParams): ChartImplementationOptionsWithHandlers => {
  const stretch: ChartImplementationOptions['stretch'] = options.stretch;
  const pan: ChartImplementationOptions['pan'] = options.pan;
  const resampling: ChartImplementationOptions['resampling'] = options.resampling;
  const seriesGroupKeys = options.seriesGroupKeys ?? data.map((series) => series.lineGroupKey);

  return {
    shapes: resolveChartShapes(shapes),
    icons: icons ?? EMPTY_CHART_ICONS,
    note: options.note,
    stretch,
    pan,
    resampling,
    clipZoomToData: options.clipZoomToData,
    seriesVisibility,
    seriesGroupKeys,
    onSeriesVisibilityChange: handleSeriesVisibilityChange,
    onSeriesVisibilityGroupChange: handleSeriesVisibilityGroupChange,
    onDisableAll: handleToggleAllSeriesVisibility,
    events: options.events,
  };
};

export const resolveChartDefinition = ({
  data,
  options,
  style,
  shapes,
  icons,
  seriesVisibility,
}: ResolveChartDefinitionParams): ResolvedChartDefinition => {
  const defaultLineStyle = resolveChartDefaultLineStyle(style);
  const rollover = style.rollover.show
    ? {
        show: true as const,
        color: style.rollover.color,
        dash: resolveDashConfig(style.rollover.dash),
      }
    : { show: false as const };

  const resolvedShapes: ResolvedChartDefinitionShape[] = resolveChartShapes(shapes);
  const resolvedData = resolveChartDefinitionData(data, seriesVisibility, style);

  return {
    data: resolvedData,
    shapes: resolvedShapes,
    icons: resolveChartIcons(icons, style.defaults?.iconColor ?? DEFAULT_ICON_COLOR),
    note: options.note,
    options: {
      features: {
        stretch: options.stretch.enable
          ? { enable: true, trigger: options.stretch.trigger }
          : { enable: false },
        pan: options.pan.enable ? { enable: true, trigger: options.pan.trigger } : { enable: false },
        rollover,
      },
      resampling: options.resampling,
      events: options.events,
      clipZoomToData: options.clipZoomToData,
    },
    styles: {
      chartOnly: style.chartOnly,
      backgroundColor: style.backgroundColor,
      textColor: style.textColor,
      zeroLineColor: style.zeroLineColor ?? DEFAULT_ZERO_LINE_COLOR,
      defaultStyles: {
        seriesColors: style.defaults?.seriesColors != null ? [...style.defaults.seriesColors] : [],
        lineStyles: defaultLineStyle,
        iconColor: style.defaults?.iconColor ?? DEFAULT_ICON_COLOR,
      },
    },
  };
};
