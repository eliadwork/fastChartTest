import {
  CHART_RESAMPLING_PRECISION_DEFAULT,
  CHART_RESAMPLING_PRECISION_OFF,
} from '../chartConstants';
import { DEFAULT_SHAPE_STYLE } from '../defaultsChartStyles';
import type {
  ChartImplementationOptions,
  ChartImplementationOptionsWithHandlers,
} from '../chartImplementationContracts';
import type {
  ChartData,
  ChartFeatureToggleOption,
  ChartFeaturesOptions,
  ChartIcon,
  ChartOptions,
  ChartResamplingOption,
  ChartShape,
  ChartStyle,
  KeyTriggeredOption,
} from '../types';
import { resolveChartDataSeriesStyle } from './resolveChartDataSeriesStyle';

const EMPTY_CHART_DATA: ChartData = [];
const EMPTY_CHART_OPTIONS: ChartOptions = {};
const EMPTY_CHART_SHAPES: ChartShape[] = [];
const EMPTY_CHART_ICONS: ChartIcon[] = [];

const DEFAULT_STRETCH: KeyTriggeredOption = { enable: true, trigger: 'rightClick' };
const DEFAULT_PAN: KeyTriggeredOption = { enable: true, trigger: 'shift' };
const DEFAULT_RESAMPLING: ChartResamplingOption = {
  enable: false,
  precision: CHART_RESAMPLING_PRECISION_OFF,
};

export interface ResolvedChartFeatureToggleOption extends ChartFeatureToggleOption {
  enabled: boolean;
}

export type ResolvedChartFeaturesOptions = Omit<ChartFeaturesOptions, 'legend' | 'toolbar'> & {
  legend: ResolvedChartFeatureToggleOption;
  toolbar: ResolvedChartFeatureToggleOption;
};

export interface ResolvedChartOptions
  extends Omit<ChartOptions, 'features' | 'stretch' | 'pan' | 'resampling' | 'clipZoomToData'> {
  features: ResolvedChartFeaturesOptions;
  stretch: KeyTriggeredOption;
  pan: KeyTriggeredOption;
  resampling: ChartResamplingOption;
  clipZoomToData: boolean;
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

const resolveFeatureToggle = (
  option?: ChartFeatureToggleOption
): ResolvedChartFeatureToggleOption => ({
  enabled: option?.enabled !== false,
});

const resolveChartShapes = (shapes?: ChartShape[]): ChartShape[] => {
  if (shapes == null || shapes.length === 0) {
    return EMPTY_CHART_SHAPES;
  }

  return shapes.map((shape) => {
    if (shape.shape === 'box') {
      return shape;
    }

    return {
      ...shape,
      color: shape.color ?? DEFAULT_SHAPE_STYLE.color,
      dash: shape.dash ?? DEFAULT_SHAPE_STYLE.dash,
    };
  });
};

export const resolveChartData = (data: ChartData | null, chartStyle: ChartStyle): ChartData => {
  const chartData = data ?? EMPTY_CHART_DATA;
  if (chartData.length === 0) {
    return EMPTY_CHART_DATA;
  }

  const seriesColors = chartStyle.defaults?.seriesColors ?? [];
  const defaultStrokeThickness = chartStyle.defaults?.strokeThickness ?? 0;

  return chartData.map((line, index) => ({
    ...line,
    style: resolveChartDataSeriesStyle({
      style: line.style,
      defaultColor: seriesColors[index % seriesColors.length] ?? DEFAULT_SHAPE_STYLE.color,
      defaultThickness: defaultStrokeThickness,
    }),
  }));
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
