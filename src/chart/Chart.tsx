import type { ChartHeaderModel, ChartToolbarModel } from './hooks/useChart';
import type { ChartImplementationProps } from './implementation/implementationProps';
import type { ChartData, ChartIcon, ChartOptions, ChartShape, ChartStyle } from './types';

import { memo, useMemo } from 'react';
import {
  ChartVisibilityOffIcon,
  ChartVisibilityOnIcon,
  ChartZoomBackIcon,
  ChartZoomResetIcon,
} from '../assets/chartIcons';
import { InfoTooltip } from '../shared';
import {
  ChartPanelHeader,
  ChartPanelHeaderText,
  ChartPanelNote,
  ChartPanelTitle,
  ChartWrapperBox,
} from '../styled/ChartStyled';
import {
  CHART_TOOLTIP_DISABLE_ALL,
  CHART_TOOLTIP_ENABLE_ALL,
  CHART_TOOLTIP_ZOOM_BACK,
  CHART_TOOLTIP_ZOOM_RESET,
} from './chartConstants';
import { ChartHeaderContent, ChartHeaderTextContent, ChartToolbar } from './ChartStyled';
import { ChartToolbarButton } from './ChartToolbarButton';
import { defaultChartImplementation } from './defaultChartImplementation';
import { useChart } from './hooks/useChart';
import { useChartLegendSlot } from './hooks/useChartLegendSlot';
import { useDefaultChartStyle } from './hooks/useDefaultChartStyle';
import { getChartHowToUseText } from './utils/getChartHowToUseText';

export interface ChartProps {
  data: ChartData | null;
  chartId?: string;
  title?: string;
  options?: ChartOptions;
  style?: React.CSSProperties;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  chartStyle?: ChartStyle;
  onSeriesVisibilityChange?: (visibility: boolean[]) => void;
  toolbarSlot?: React.ReactNode | ((props: { textColor: string }) => React.ReactNode);
  implementationComponent?: React.ComponentType<ChartImplementationProps>;
}

export interface ChartHeaderSectionProps {
  headerModel: ChartHeaderModel;
  howToUseText: string;
  loading: boolean;
  toolbarSlot?: React.ReactNode | ((props: { textColor: string }) => React.ReactNode);
  toolbarModel: ChartToolbarModel;
}

const ChartToolbarSection = ({
  loading,
  textColor,
  toolbarSlot,
  toolbarModel,
}: {
  loading: boolean;
  textColor: string;
  toolbarSlot?: React.ReactNode | ((props: { textColor: string }) => React.ReactNode);
  toolbarModel: ChartToolbarModel;
}) => {
  if (loading) {
    return null;
  }

  return (
    <ChartToolbar>
      <ChartToolbarButton
        tooltip={CHART_TOOLTIP_ZOOM_BACK}
        textColor={textColor}
        onClick={() => toolbarModel.zoomBackRef.current?.()}
        disabled={!toolbarModel.canZoomBack}
      >
        <ChartZoomBackIcon />
      </ChartToolbarButton>
      <ChartToolbarButton
        tooltip={CHART_TOOLTIP_ZOOM_RESET}
        textColor={textColor}
        onClick={() => toolbarModel.zoomResetRef.current?.()}
      >
        <ChartZoomResetIcon />
      </ChartToolbarButton>
      <ChartToolbarButton
        tooltip={
          toolbarModel.allSeriesHidden ? CHART_TOOLTIP_ENABLE_ALL : CHART_TOOLTIP_DISABLE_ALL
        }
        textColor={textColor}
        onClick={toolbarModel.handleToggleAllSeriesVisibility}
      >
        {toolbarModel.allSeriesHidden ? <ChartVisibilityOnIcon /> : <ChartVisibilityOffIcon />}
      </ChartToolbarButton>
      {typeof toolbarSlot === 'function' ? toolbarSlot({ textColor }) : toolbarSlot}
    </ChartToolbar>
  );
};

const ChartHeaderSection = ({
  headerModel,
  howToUseText,
  loading,
  toolbarSlot,
  toolbarModel,
}: ChartHeaderSectionProps) => {
  if (!headerModel.showHeader) {
    return null;
  }

  return (
    <ChartPanelHeader sx={headerModel.headerSx}>
      <ChartPanelHeaderText>
        <ChartHeaderContent>
          <InfoTooltip title={howToUseText} color={headerModel.textColor} />
          <ChartHeaderTextContent>
            {headerModel.title != null && (
              <ChartPanelTitle variant="subtitle1">{headerModel.title}</ChartPanelTitle>
            )}
            {headerModel.note != null && (
              <ChartPanelNote variant="body2">{headerModel.note}</ChartPanelNote>
            )}
          </ChartHeaderTextContent>
        </ChartHeaderContent>
      </ChartPanelHeaderText>
      <ChartToolbarSection
        loading={loading}
        textColor={headerModel.textColor}
        toolbarSlot={toolbarSlot}
        toolbarModel={toolbarModel}
      />
    </ChartPanelHeader>
  );
};

const ChartComponent = ({
  data,
  chartId,
  title,
  options = {},
  style,
  shapes,
  icons,
  chartStyle: chartStyleProp,
  onSeriesVisibilityChange,
  toolbarSlot,
  implementationComponent = defaultChartImplementation,
}: ChartProps) => {
  const defaultChartStyle = useDefaultChartStyle();
  const chartStyle = chartStyleProp ?? defaultChartStyle;

  const {
    loading,
    options: resolvedOptions,
    legendProps,
    headerModel,
    toolbarModel,
    implementationModel,
  } = useChart({
    data,
    chartId,
    title,
    options,
    shapes,
    icons,
    chartStyle,
    onSeriesVisibilityChange,
  });

  const legendSlot = useChartLegendSlot({
    show: !!legendProps,
    ...(legendProps ?? {}),
  });

  const howToUseText = useMemo(
    () =>
      getChartHowToUseText({
        wrapperOptions: implementationModel.wrapperOptions,
        chartOnly: implementationModel.wrapperStyle.chartOnly,
        howToUseAdditional: resolvedOptions.howToUseAdditional,
      }),
    [
      implementationModel.wrapperOptions,
      implementationModel.wrapperStyle.chartOnly,
      resolvedOptions.howToUseAdditional,
    ]
  );

  const ImplementationComponent = implementationComponent;

  return (
    <ChartWrapperBox>
      <ChartHeaderSection
        headerModel={headerModel}
        howToUseText={howToUseText}
        loading={loading}
        toolbarSlot={toolbarSlot}
        toolbarModel={toolbarModel}
      />
      <ImplementationComponent
        chartId={implementationModel.chartId}
        lines={implementationModel.chartData}
        style={implementationModel.wrapperStyle}
        options={implementationModel.wrapperOptions}
        zoomCallbacks={implementationModel.zoomCallbacks}
        containerStyle={style}
        overlaySlot={legendSlot}
        loading={loading}
      />
    </ChartWrapperBox>
  );
};

export const Chart = memo(ChartComponent);
