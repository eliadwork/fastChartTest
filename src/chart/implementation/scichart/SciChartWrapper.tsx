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
import { CHART_DEFAULT_ICON_COLOR } from '../../defaultsChartStyles';
import { useSciChartOptionsModel } from './hooks/useSciChartOptionsModel';
import { useSciChartSetup } from './hooks/useSciChartRuntimeModel';
import { useSciChartRuntimeSync } from './hooks/useSciChartRuntimeSync';
import { SCI_CHART_WASM_NO_SIMD_URL, SCI_CHART_WASM_URL } from './sciChartWrapperConstants';
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
  const { convertedData, mergedOptions } = useSciChartOptionsModel({
    chartId,
    lines,
    style,
    optionsInput,
  });

  const { initChart, lineShapes, boxes, dataBounds, seriesConfig } = useSciChartSetup({
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
            defaultColor={mergedOptions.defaultIconColor ?? CHART_DEFAULT_ICON_COLOR}
            iconSize={1}
            dataBounds={dataBounds}
            clipZoomToData={mergedOptions.clipZoomToData !== false}
            seriesConfig={seriesConfig}
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
