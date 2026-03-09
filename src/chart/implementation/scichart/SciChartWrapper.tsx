/**
 * SciChartWrapper – single SciChart implementation component.
 * Converts options/data, creates initChart, runs runtime sync hooks, and renders SciChartReact.
 */

import type { ChartImplementationProps } from '../implementationProps';
import type { UseSciChartRuntimeSyncOptions } from './hooks/useSciChartRuntimeSync';

import { SciChartSurface } from 'scichart';
import { SciChartReact } from 'scichart-react';

import { SkeletonLoading } from '../../../shared/SkeletonLoading';
import { ChartWrapperBox } from '../../../styled/ChartStyled';
import {
  CHART_DEFAULT_SERIES_COLORS,
  CHART_FALLBACK_ROLLOVER_STROKE,
  CHART_ROLLOVER_DASH_STEPS,
} from '../../chartConstants';
import { toInternalOptions } from './convert';
import { useSciChartMergedOptions } from './hooks/useSciChartMergedOptions';
import { useSciChartRuntimeModel } from './hooks/useSciChartRuntimeModel';
import { useSciChartRuntimeSync } from './hooks/useSciChartRuntimeSync';
import {
  SCI_CHART_DEFAULT_ICON_COLOR,
  SCI_CHART_WASM_NO_SIMD_URL,
  SCI_CHART_WASM_URL,
} from './sciChartWrapperConstants';
import { SciChartContainer, SciChartSurfaceStyle } from './SciChartWrapperStyled';

SciChartSurface.configure({
  wasmUrl: SCI_CHART_WASM_URL,
  wasmNoSimdUrl: SCI_CHART_WASM_NO_SIMD_URL,
});

const SciChartRuntimeEffects = (params: UseSciChartRuntimeSyncOptions) => {
  useSciChartRuntimeSync(params);
  return null;
};

export const SciChartWrapper = ({
  chartId,
  lines,
  style,
  options: optionsInput = {},
  zoomCallbacks,
  containerStyle,
  overlaySlot,
  loading = false,
}: ChartImplementationProps) => {
  const seriesVisibility =
    optionsInput.seriesVisibility ?? Array.from({ length: lines.length }, () => true);

  const { data: convertedData, options: convertedOptions } = toInternalOptions(
    { chartId, lines, style, options: optionsInput },
    seriesVisibility
  );

  const mergedTheme = {
    defaultSeriesColors: CHART_DEFAULT_SERIES_COLORS,
    rolloverStroke: CHART_FALLBACK_ROLLOVER_STROKE,
    rolloverDash: { isDash: true, steps: [...CHART_ROLLOVER_DASH_STEPS] },
  };

  const mergedOptions = useSciChartMergedOptions({
    convertedOptions,
    chartTheme: mergedTheme,
    opts: optionsInput,
  });

  const { initChart, lineShapes, boxes } = useSciChartRuntimeModel({
    data: convertedData,
    options: mergedOptions,
    zoomCallbacks,
  });

  if (loading) {
    return (
      <ChartWrapperBox style={containerStyle}>
        <SkeletonLoading />
      </ChartWrapperBox>
    );
  }

  return (
    <ChartWrapperBox style={containerStyle}>
      <SciChartContainer>
        <SciChartReact
          style={SciChartSurfaceStyle}
          fallback={<SkeletonLoading />}
          initChart={initChart}
        >
          <SciChartRuntimeEffects
            zoomCallbacks={zoomCallbacks}
            icons={mergedOptions.icons ?? []}
            defaultColor={SCI_CHART_DEFAULT_ICON_COLOR}
            iconSize={1}
            seriesVisibility={mergedOptions.seriesVisibility}
            lineShapes={lineShapes}
            boxes={boxes}
            data={convertedData}
          />
          {!mergedOptions.chartOnly && overlaySlot}
        </SciChartReact>
      </SciChartContainer>
    </ChartWrapperBox>
  );
};
