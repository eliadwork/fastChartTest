/**
 * Chart – Generic facade. Owns header, legend, series visibility.
 * Delegates to injected implementation component.
 */

import type { ChartImplementationProps } from './implementation/implementationProps';
import type { ChartData, ChartIcon, ChartOptions, ChartShape, ChartStyle } from './types';

import {
  ChartVisibilityOffIcon,
  ChartVisibilityOnIcon,
  ChartZoomBackIcon,
  ChartZoomResetIcon,
} from '../assets/chartIcons';
import { memo } from 'react';
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
import { ChartToolbar } from './ChartStyled';
import { ChartToolbarButton } from './ChartToolbarButton';
import { defaultChartImplementation } from './defaultChartImplementation';
import { useChart } from './hooks/useChart';
import { useChartLegendSlot } from './hooks/useChartLegendSlot';

export interface ChartProps {
  data: ChartData | null;
  chartId?: string;
  title?: string;
  options?: ChartOptions;
  style?: React.CSSProperties;
  shapes?: ChartShape[];
  icons?: ChartIcon[];
  chartStyle?: ChartStyle;
  implementationComponent?: React.ComponentType<ChartImplementationProps>;
}

const ChartComponent = ({
  data,
  chartId,
  title,
  options = {},
  style,
  shapes,
  icons,
  chartStyle,
  implementationComponent = defaultChartImplementation,
}: ChartProps) => {
  const {
    chartData,
    wrapperStyle,
    wrapperOptions,
    zoomCallbacks,
    showHeader,
    headerSx,
    legendProps,
    textColor,
    zoomBackRef,
    zoomResetRef,
    canZoomBack,
    handleDisableAll,
    allSeriesHidden,
    loading,
  } = useChart({
    data,
    chartId,
    title,
    options,
    shapes,
    icons,
    chartStyle,
  });

  const legendSlot = useChartLegendSlot({
    show: !!legendProps,
    ...(legendProps ?? {}),
  });

  const ImplementationComponent = implementationComponent;

  return (
    <ChartWrapperBox>
      {showHeader && (
        <ChartPanelHeader sx={headerSx}>
          <ChartPanelHeaderText>
            {title != null && <ChartPanelTitle variant="subtitle1">{title}</ChartPanelTitle>}
            {options.note != null && (
              <ChartPanelNote variant="body2">{options.note}</ChartPanelNote>
            )}
          </ChartPanelHeaderText>
          {!loading && (
            <ChartToolbar>
              <ChartToolbarButton
                tooltip={CHART_TOOLTIP_ZOOM_BACK}
                textColor={textColor}
                onClick={() => zoomBackRef.current?.()}
                disabled={!canZoomBack}
              >
                <ChartZoomBackIcon />
              </ChartToolbarButton>
              <ChartToolbarButton
                tooltip={CHART_TOOLTIP_ZOOM_RESET}
                textColor={textColor}
                onClick={() => zoomResetRef.current?.()}
              >
                <ChartZoomResetIcon />
              </ChartToolbarButton>
              <ChartToolbarButton
                tooltip={allSeriesHidden ? CHART_TOOLTIP_ENABLE_ALL : CHART_TOOLTIP_DISABLE_ALL}
                textColor={textColor}
                onClick={handleDisableAll}
              >
                {allSeriesHidden ? <ChartVisibilityOnIcon /> : <ChartVisibilityOffIcon />}
              </ChartToolbarButton>
            </ChartToolbar>
          )}
        </ChartPanelHeader>
      )}
      <ImplementationComponent
        chartId={chartId}
        lines={chartData}
        style={wrapperStyle}
        options={wrapperOptions}
        zoomCallbacks={zoomCallbacks}
        containerStyle={style}
        overlaySlot={legendSlot}
        loading={loading}
      />
    </ChartWrapperBox>
  );
};

export const Chart = memo(ChartComponent);
