import type { ChartData, ChartDataSeries, ChartShape } from './chart/types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';

import { DEFAULT_CHART_ICONS } from './chart/defaultsChartStyles';
import { Detect } from './features/detect/Detect';
import { FastChartingPanel } from './features/fastCharting/FastChartingPanel';
import { ChartComparison, ChartComparisonGrid, ChartPanel } from './styled/ChartStyled';

const App = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const addedLineCounterRef = useRef(1);
  useDataSetting(setChartData);

  const handleAddLine = () => {
    setChartData((previousData) => {
      if (previousData == null || previousData.length === 0) {
        return previousData;
      }

      const sourceLine = previousData[0];
      const nextCopyIndex = addedLineCounterRef.current;
      addedLineCounterRef.current += 1;
      const yOffset = nextCopyIndex * 500;
      const copiedY = Array.from(sourceLine.y, (value) => value + yOffset);

      const copiedLine: ChartDataSeries = {
        ...sourceLine,
        name: `Demo-Copy-${nextCopyIndex}`,
        lineGroupKey: `Demo-Copy-${nextCopyIndex}`,
        y: copiedY,
      };

      return [...previousData, copiedLine];
    });
  };

  return (
    <ChartComparison>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleAddLine}
          disabled={chartData == null || chartData.length === 0}
        >
          Add Line
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0 }}>
        <ChartComparisonGrid sx={{ flex: 1, minWidth: 0 }}>
          <ChartPanel>
            <DetectStyled
              chartId="resampled"
              title="Resampled (precision 1.0)"
              data={chartData}
              shapes={exampleShapes}
              options={{
                note: 'this is the chart example',
                resampling: { enable: true, precision: 1 },
              }}
              icons={DEFAULT_CHART_ICONS}
            />
          </ChartPanel>
          <ChartPanel>
            <DetectStyled
              chartId="no-loss"
              title="No-loss (every point)"
              data={chartData}
              shapes={exampleShapes}
              options={{
                note: 'this is the chart example',
              }}
            />
          </ChartPanel>
        </ChartComparisonGrid>
        <FastChartingPanel
          chartId="fast"
          title="Fast chart"
          data={chartData}
          shapes={exampleShapes}
          options={{
            note: '20% panel',
            clipZoomToData: true,
          }}
          icons={DEFAULT_CHART_ICONS}
        />
      </Box>
    </ChartComparison>
  );
};

export default App;

const DetectStyled = styled(Detect)(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
}));

const exampleShapes: ChartShape[] = [
  {
    shape: 'line',
    color: '#00ff00',
    axis: 'x',
    value: 250000,
  },
  {
    shape: 'box',
    name: 'Target Region',
    color: '#00BFFF',
    coordinates: { x1: 100000, x2: 200000, y1: -1000, y2: 1000 },
  },
  {
    shape: 'box',
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
  }, [setChartData]);
};
