import { useContext } from 'react';
import { SciChartSurface } from 'scichart';
import { SciChartSurfaceContext } from 'scichart-react';

interface SciChartRuntimeContextValue {
  sciChartSurface?: SciChartSurface;
}

export const useSciChartSurfaceContext = (): SciChartRuntimeContextValue => {
  const contextValue = useContext(SciChartSurfaceContext) as SciChartRuntimeContextValue | undefined;

  if (contextValue === undefined) {
    throw new Error('useSciChartSurfaceContext must be used within SciChartReact');
  }

  return contextValue;
};
