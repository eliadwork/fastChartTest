import type { ChartData, ChartDataSeries } from './chart/types';

import { styled, useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';

import { chartIcons } from './assets/chartIcons';
import { Detect } from './features/detect/Detect';
import {
  ChartComparison,
  ChartComparisonGrid,
  ChartPanel,
} from './styled/ChartStyled';

const DetectStyled = styled(Detect)(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
}));


const App = () => {
  const theme = useTheme();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  useDataSetting(setChartData);


  const baseStyle = {
    backgroundColor: theme.palette.background.paper,
    rollover: {
      show: true,
      color: '#FF0000',
      dash: { isDash: true, steps: [8, 4] as number[] },
    },
    textColor: theme.palette.text.primary,
    chartOnly: false,
  };


  return (
    <ChartComparison>
      <ChartComparisonGrid>
        <ChartPanel>
          <DetectStyled
            chartId="resampled"
            title="Resampled (precision 1.0)"
            data={chartData}
            style={baseStyle}
            shapes={exampleShapes}
            options={{
              note: 'this is the chart example',
              resampling: { enable: true, precision: 1 },
              clipZoomToData: true,
            }}
            icons={chartIcons}
          />
        </ChartPanel>
        <ChartPanel>
          <DetectStyled
            chartId="no-loss"
            title="No-loss (every point)"
            data={chartData}
            style={baseStyle}
            shapes={exampleShapes}
            options={{
              note: 'this is the chart example',
              clipZoomToData: true,
            }}
          />
        </ChartPanel>
      </ChartComparisonGrid>
    </ChartComparison>
  );
};

export default App;



const exampleShapes = [
  {
    shape: 'line' as const,
    color: '#00ff00',
    axis: 'x' as const,
    value: 250000,
  },
  {
    shape: 'box' as const,
    name: 'Target Region',
    color: '#00BFFF',
    coordinates: { x1: 100000, x2: 200000, y1: -5000, y2: 5000 },
  },
  {
    shape: 'box' as const,
    name: 'Full-height band',
    color: '#FFA500',
    fill: '#FFA50022',
    coordinates: { x1: 350000, x2: 450000 },
  },
];

const useDataSetting = (setChartData: (data: ChartData) => void) => {
  useEffect(() => {
    const worker = new Worker(new URL('./dataWorker.js', import.meta.url), {
      type: 'module',
    });

    worker.onerror = (errorEvent) => {
      console.error(
        '[dataWorker] Error:',
        errorEvent.message,
        errorEvent.filename,
        errorEvent.lineno
      );

      const sampleX = new Float64Array([0, 100_000, 200_000, 300_000, 400_000, 500_000]);
      const sampleY = new Float64Array([0, 1000, -500, 2000, -1000, 0]);

      setChartData([
        {
          x: sampleX,
          y: sampleY,
          name: 'Fallback-S0',
          lineGroupKey: 'Fallback',
          style: { bindable: true },
        },
      ]);

      worker.terminate();
    };

    worker.onmessage = ({
      data: { lines },
    }: {
      data: {
        lines: Array<{
          x: ArrayBuffer;
          y: ArrayBuffer;
          name: string;
          lineGroupKey?: string;
          style: ChartDataSeries['style'];
        }>;
      };
    }) => {
      if (!lines?.length) {
        console.warn('[dataWorker] Received empty lines');
        return;
      }

      setChartData(
        lines.map((line) => ({
          x: new Float64Array(line.x),
          y: new Float64Array(line.y),
          name: line.name,
          lineGroupKey: line.lineGroupKey,
          style: line.style ?? { bindable: true },
        }))
      );

      worker.terminate();
    };

    worker.postMessage({});
    return () => worker.terminate();
  }, []);
}
