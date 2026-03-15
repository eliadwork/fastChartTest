/**
 * SciChartWrapper – single SciChart implementation component.
 * Converts options/data, creates initChart, runs runtime sync hooks, and renders SciChartReact.
 */

import type { ChartImplementationProps } from '../implementationProps';
import type { UseSciChartRuntimeSyncFlowOptions } from './hooks/flow/useSciChartRuntimeSyncFlow';

import { useMemo } from 'react';
import { SciChartSurface } from 'scichart';
import { SciChartReact } from 'scichart-react';

import { SkeletonLoading } from '../../../shared/SkeletonLoading';
import { ChartWrapperBox } from '../../../styled/ChartStyled';
import { useSciChartRuntimeFlow } from './hooks/flow/useSciChartRuntimeFlow';
import { useSciChartRuntimeSyncFlow } from './hooks/flow/useSciChartRuntimeSyncFlow';
import { useSciChartOptionsModel } from './hooks/model/useSciChartOptionsModel';
import { SCI_CHART_WASM_NO_SIMD_URL, SCI_CHART_WASM_URL } from './sciChartWrapperConstants';
import { SciChartContainer, SciChartSurfaceStyle } from './SciChartWrapperStyled';

SciChartSurface.configure({
  wasmUrl: SCI_CHART_WASM_URL,
  wasmNoSimdUrl: SCI_CHART_WASM_NO_SIMD_URL,
});

const SciChartRuntimeEffects = (params: UseSciChartRuntimeSyncFlowOptions) => {
  useSciChartRuntimeSyncFlow(params);
  return null;
};

export const SciChartWrapper = ({
  lines,
  style,
  options,
  zoomCallbacks,
  containerStyle,
  overlaySlot,
  loading = false,
}: ChartImplementationProps) => {
  const definition = useSciChartOptionsModel({
    lines,
    style,
    options,
  });

  const runtimeDefinition = useMemo(() => {
    if (!zoomCallbacks) {
      return definition;
    }

    return {
      ...definition,
      options: {
        ...definition.options,
        events: definition.options.events
          ? { ...definition.options.events, zoom: zoomCallbacks }
          : { zoom: zoomCallbacks },
      },
    };
  }, [definition, zoomCallbacks]);

  const { initChart, dataBounds } = useSciChartRuntimeFlow({
    definition: runtimeDefinition,
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
            definition={runtimeDefinition}
            dataBounds={dataBounds}
          />
          {!definition.styles.chartOnly && overlaySlot}
        </SciChartReact>
      </SciChartContainer>
    </ChartWrapperBox>
  );
};
