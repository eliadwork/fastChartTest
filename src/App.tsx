import type { ChartShape } from './chart';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { DEFAULT_CHART_ICONS } from './chart/defaultsChartStyles';
import { SciChartWrapper } from './chart/implementation/scichart/SciChartWrapper';
import { useChartDataFlow } from './features/chartData';
import { Detect } from './features/detect/Detect';
import { FastChartingPanel } from './features/fastCharting/FastChartingPanel';
import { ChartComparison, ChartComparisonGrid, ChartPanel } from './styled/ChartStyled';

const App = () => {
  const { chartData, canAddLine, addLine } = useChartDataFlow();

  return (
    <ChartComparison>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={addLine}
          disabled={!canAddLine}
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
              implementationComponent={SciChartWrapper}
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
              implementationComponent={SciChartWrapper}
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
          implementationComponent={SciChartWrapper}
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
