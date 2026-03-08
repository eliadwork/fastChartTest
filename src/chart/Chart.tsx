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
import { InfoTooltip } from '../shared';
import { memo, useMemo } from 'react';
import Box from '@mui/material/Box';
import {
  ChartPanelHeader,
  ChartPanelHeaderText,
  ChartPanelNote,
  ChartPanelTitle,
  ChartWrapperBox,
} from '../styled/ChartStyled';
import { getChartHowToUseText } from './utils/getChartHowToUseText';
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
import { useDefaultChartStyle } from './hooks/useDefaultChartStyle';
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
  /** Called when series visibility changes. Used by Detect for modal. */
  onSeriesVisibilityChange?: (visibility: boolean[]) => void;
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
  chartStyle: chartStyleProp,
  onSeriesVisibilityChange,
  implementationComponent = defaultChartImplementation,
}: ChartProps) => {
  const defaultChartStyle = useDefaultChartStyle();
  const chartStyle = chartStyleProp ?? defaultChartStyle;

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
    onSeriesVisibilityChange,
  });

  const legendSlot = useChartLegendSlot({
    show: !!legendProps,
    ...(legendProps ?? {}),
  });

  const howToUseText = useMemo(
    () =>
      getChartHowToUseText({
        wrapperOptions,
        chartOnly: wrapperStyle.chartOnly,
        howToUseAdditional: options.howToUseAdditional,
      }),
    [wrapperOptions, wrapperStyle.chartOnly, options.howToUseAdditional]
  );

  const ImplementationComponent = implementationComponent;

  return (
    <ChartWrapperBox>
      {showHeader && (
        <ChartPanelHeader sx={headerSx}>
          <ChartPanelHeaderText>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, flex: 1, minWidth: 0 }}>
              <InfoTooltip title={howToUseText} color={textColor} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {title != null && <ChartPanelTitle variant="subtitle1">{title}</ChartPanelTitle>}
                {options.note != null && (
                  <ChartPanelNote variant="body2">{options.note}</ChartPanelNote>
                )}
              </Box>
            </Box>
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
