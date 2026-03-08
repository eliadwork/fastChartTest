/**
 * Chart – Generic facade. Owns header, legend, series visibility.
 * Delegates to implementation. No implementation-specific imports.
 */

import UndoIcon from '@mui/icons-material/Undo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { memo, useMemo } from 'react';
import { LogoIcon } from '../assets/pointMarkIcon';
import {
  ChartPanelHeader,
  ChartPanelHeaderText,
  ChartPanelNote,
  ChartPanelTitle,
  ChartWrapperBox,
} from '../styled';
import {
  CHART_TOOLTIP_DISABLE_ALL,
  CHART_TOOLTIP_ENABLE_ALL,
  CHART_TOOLTIP_ZOOM_BACK,
  CHART_TOOLTIP_ZOOM_RESET,
} from './chartConstants';
import { ChartToolbar } from './ChartStyled';
import { ChartToolbarButton } from './ChartToolbarButton';
import { useChart } from './hooks/useChart';
import { SciChartWrapper } from './implementation/scichart';
import { Legend } from './Legend';
import type { ChartData, ChartIcon, ChartOptions, ChartStyle } from './types';
import type { LegendProps } from './Legend';

export type UseChartLegendSlotParams = { show: boolean } & Partial<LegendProps>;

/** Returns the Legend component for overlaySlot when show is true. */
export const useChartLegendSlot = (params: UseChartLegendSlotParams): React.ReactNode => {
  const {
    show,
    backgroundColor,
    textColor,
    seriesVisibility = [],
    seriesGroupKeys,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  } = params;
  return useMemo(() => {
    if (!show) return null;
    return (
      <Legend
        backgroundColor={backgroundColor}
        textColor={textColor}
        seriesVisibility={seriesVisibility}
        seriesGroupKeys={seriesGroupKeys}
        onSeriesVisibilityChange={onSeriesVisibilityChange}
        onSeriesVisibilityGroupChange={onSeriesVisibilityGroupChange}
      />
    );
  }, [
    show,
    backgroundColor,
    textColor,
    seriesVisibility,
    seriesGroupKeys,
    onSeriesVisibilityChange,
    onSeriesVisibilityGroupChange,
  ]);
};

export interface ChartProps {
  data: ChartData | null;
  chartId?: string;
  title?: string;
  options?: ChartOptions;
  style?: React.CSSProperties;
  icons?: ChartIcon[];
  /** Optional style override. When absent, built from theme. */
  chartStyle?: ChartStyle;
}

const ChartComponent = ({
  data,
  chartId,
  title,
  options = {},
  style,
  icons,
  chartStyle,
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
    icons,
    chartStyle,
  });

  const legendSlot = useChartLegendSlot({
    show: !!legendProps,
    ...(legendProps ?? {}),
  });

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
                <UndoIcon />
              </ChartToolbarButton>
              <ChartToolbarButton
                tooltip={CHART_TOOLTIP_ZOOM_RESET}
                textColor={textColor}
                onClick={() => zoomResetRef.current?.()}
              >
                <LogoIcon />
              </ChartToolbarButton>
              <ChartToolbarButton
                tooltip={allSeriesHidden ? CHART_TOOLTIP_ENABLE_ALL : CHART_TOOLTIP_DISABLE_ALL}
                textColor={textColor}
                onClick={handleDisableAll}
              >
                {allSeriesHidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </ChartToolbarButton>
            </ChartToolbar>
          )}
        </ChartPanelHeader>
      )}
      <SciChartWrapper
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
