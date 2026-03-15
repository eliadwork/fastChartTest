/**
 * SciChartWrapper – single SciChart implementation component.
 * Resolves SciChart runtime definition, creates initChart, runs sync hooks, and renders SciChartReact.
 */

import type { ChartImplementationProps } from '../implementationProps';
import type { UseSciChartRuntimeSyncFlowOptions } from './hooks/flow/useSciChartRuntimeSyncFlow';

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
  definition,
  containerStyle,
  overlaySlot,
  loading = false,
}: ChartImplementationProps) => {
  const sciChartDefinition = useSciChartOptionsModel({
    definition,
  });

  const { initChart, dataBounds } = useSciChartRuntimeFlow({
    definition: sciChartDefinition,
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
            definition={sciChartDefinition}
            dataBounds={dataBounds}
          />
          {!sciChartDefinition.styles.chartOnly && overlaySlot}
        </SciChartReact>
      </SciChartContainer>
    </ChartWrapperBox>
  );
};
