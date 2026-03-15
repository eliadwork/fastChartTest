/**
 * SciChartWrapper – single SciChart implementation component.
 * Converts implementation props into a SciChart definition, creates initChart,
 * runs runtime sync hooks, and renders SciChartReact.
 */

import type { ChartImplementationProps } from '../implementationProps';
import type { UseSciChartRuntimeSyncOptions } from './hooks/useSciChartRuntimeSync';

import { useMemo } from 'react';
import { SciChartSurface } from 'scichart';
import { SciChartReact } from 'scichart-react';

import { SkeletonLoading } from '../../../shared/SkeletonLoading';
import { ChartWrapperBox } from '../../../styled/ChartStyled';
import { toSciChartDefinition } from './convert';
import { useSciChartDataBounds } from './hooks/useSciChartDataBounds';
import { useSciChartInitChart } from './hooks/useSciChartInitChart';
import { useSciChartRuntimeSync } from './hooks/useSciChartRuntimeSync';
import {
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

  const definition = useMemo(
    () =>
      toSciChartDefinition(
        { chartId, lines, style, options: optionsInput, zoomCallbacks },
        seriesVisibility
      ),
    [chartId, lines, style, optionsInput, zoomCallbacks, seriesVisibility]
  );

  const dataBounds = useSciChartDataBounds(definition.data);
  const initChart = useSciChartInitChart({
    definition,
    dataBounds,
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
            definition={definition}
            shapes={definition.shapes}
            dataBounds={dataBounds}
          />
          {!definition.styles.chartOnly && overlaySlot}
        </SciChartReact>
      </SciChartContainer>
    </ChartWrapperBox>
  );
};
