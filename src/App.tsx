import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { useSnackbar } from 'notistack'
import { SciChartSurface } from 'scichart'
import { DEFAULT_POINT_MARK_ICON_SVG } from './chartTheme'
import { ChartThemeProvider } from './ChartThemeContext'
import { ChartWrapper } from './ChartWrapper'
import type { ChartData } from './chart'
import { usePointMarkStore } from './store/pointMarkStore'
import { getInterpolatedPointAtX } from './utils/chartDataLookup'
import {
  ChartComparison,
  ChartComparisonGrid,
  ChartPanel,
  ChartPlaceholder,
  PointMarkModalOverlay,
  PointMarkModalTitle,
  PointMarkModalButtons,
  PointMarkModalButton,
  PointMarkModalCancel,
} from './styled'

const POINTS_PER_SERIES = 500_000
const SERIES_COUNT = 10

// Load WASM from CDN (no build config required)
SciChartSurface.loadWasmFromCDN()

function App() {
  const theme = useTheme()
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const { enqueueSnackbar } = useSnackbar()
  const seriesPickerOpen = usePointMarkStore((s) => s.seriesPickerOpen)
  const markedXValues = usePointMarkStore((s) => s.markedXValues)
  const markedYValue = usePointMarkStore((s) => s.markedYValue)
  const chartDataForModal = usePointMarkStore((s) => s.chartDataForModal)
  const chartIdForModal = usePointMarkStore((s) => s.chartIdForModal)
  const bindableIndices = usePointMarkStore((s) => s.bindableIndices)
  const addPointMark = usePointMarkStore((s) => s.addPointMark)
  const addIcon = usePointMarkStore((s) => s.addIcon)
  const iconsByChart = usePointMarkStore((s) => s.iconsByChart)
  const closeSeriesPicker = usePointMarkStore((s) => s.closeSeriesPicker)

  useEffect(() => {
    const worker = new Worker(new URL('./dataWorker.js', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = ({ data: { x, ys } }) => {
      setChartData({
        x: new Float64Array(x),
        ys: ys.map((b: ArrayBuffer) => new Float64Array(b)),
        seriesNames: Array.from({ length: SERIES_COUNT }, (_, i) => `Series ${i}`),
      })
      worker.terminate()
    }
    worker.postMessage({ count: POINTS_PER_SERIES, seriesCount: SERIES_COUNT })
    return () => worker.terminate()
  }, [])

  const createPointMarkHandler = useCallback(
    (chartId: string) =>
      (
        xValue: number,
        yValue: number,
        context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }
      ) => {
        if (!chartData) return null
        const chartDataForStore = {
          x: chartData.x,
          ys: chartData.ys ?? (chartData.series ?? []),
          seriesNames: chartData.seriesNames,
        }
        return addPointMark(chartId, xValue, yValue, chartDataForStore, {
          seriesBindable: context?.seriesBindable,
          seriesVisibility: context?.getSeriesVisibility?.(),
        })
      },
    [chartData, addPointMark]
  )

  const handleSeriesPick = useCallback(
    (seriesIndex: number) => {
      if (!markedXValues || markedYValue == null || !chartDataForModal || !chartIdForModal) return
      const middleX = markedXValues[1]
      const point = getInterpolatedPointAtX(chartDataForModal, middleX, seriesIndex)
      if (!point) return
      addIcon(chartIdForModal, {
        iconImage: DEFAULT_POINT_MARK_ICON_SVG,
        location: { x: point.x, y: point.y },
        color: 'pink',
      })
      const seriesName =
        chartDataForModal.seriesNames?.[seriesIndex] ?? `Series ${seriesIndex}`
      enqueueSnackbar(`Y at ${point.x.toFixed(2)}: ${point.y} (${seriesName})`, {
        autoHideDuration: 60000,
      })
      closeSeriesPicker()
    },
    [markedXValues, markedYValue, chartDataForModal, chartIdForModal, addIcon, enqueueSnackbar, closeSeriesPicker]
  )

  const chartThemeOverride = {
    pointMarkIcon: DEFAULT_POINT_MARK_ICON_SVG,
    pointMarkIconColor: '#888888',
    backgroundColor: theme.palette.background.paper,
    textColor: theme.palette.text.primary,
  }

  const sharedOptions = {
    note: 'this is the chart example',
    seriesGroupKeys: [...Array(4).fill('Group one'), ...Array(6).fill(undefined)],
    seriesLines: [
      { bindable: true },
      { bindable: true },
      { thickness: 4, bindable: true },
      { thickness: 1, striped: true, bindable: true },
      { bindable: false },
      { bindable: false },
      { bindable: false },
      { bindable: false },
      { bindable: false },
      { bindable: false },
    ],
    shapes: [
      {
        shape: 'line' as const,
        color: '#ff0000',
        axis: 'x' as const,
        value: 100,
      },
      {
        shape: 'box' as const,
        name: 'Target Region',
        color: '#00BFFF',
        coordinates: { x1: 200, x2: 400, y1: -0.5, y2: 0.5 },
      },
      {
        shape: 'box' as const,
        name: 'Full-height band',
        color: '#FFA500',
        fill: '#FFA50022',
        coordinates: { x1: 600, x2: 800 },
      },
    ],
  }

  return (
    <ChartThemeProvider theme={chartThemeOverride}>
    <ChartComparison>
      <ChartComparisonGrid>
        <ChartPanel>
          {chartData ? (
            <ChartWrapper
              chartId="resampled"
              title="Resampled (precision 1.0)"
              data={chartData}
              options={{
                ...sharedOptions,
                resampling: true,
                resamplingPrecision: 1,
                onPointMark: createPointMarkHandler('resampled'),
              }}
              icons={[
                {
                  iconImage: DEFAULT_POINT_MARK_ICON_SVG,
                  location: { x: 150000, y: 1000 },
                  color: '#888888',
                },
                ...(iconsByChart['resampled'] ?? []),
              ]}
            />
          ) : (
            <ChartPlaceholder>Loading data...</ChartPlaceholder>
          )}
        </ChartPanel>
        <ChartPanel>
          {chartData ? (
            <ChartWrapper
              chartId="no-loss"
              title="No-loss (every point)"
              data={chartData}
              options={{
                ...sharedOptions,
                resampling: false,
                onPointMark: createPointMarkHandler('no-loss'),
              }}
              icons={iconsByChart['no-loss']}
            />
          ) : (
            <ChartPlaceholder>Loading data...</ChartPlaceholder>
          )}
        </ChartPanel>
      </ChartComparisonGrid>

      <PointMarkModalOverlay
        open={seriesPickerOpen && !!chartDataForModal}
        onClose={closeSeriesPicker}
      >
        <Box component="div" onClick={(e: React.MouseEvent) => e.stopPropagation()} sx={{ p: 2, maxWidth: '90vw' }}>
          <PointMarkModalTitle variant="h6">
            Which series should the middle point be connected to?
          </PointMarkModalTitle>
          <PointMarkModalButtons>
            {(bindableIndices.length > 0
              ? bindableIndices
              : chartDataForModal?.seriesNames
                ? Array.from({ length: chartDataForModal.seriesNames.length }, (_, i) => i)
                : chartDataForModal?.ys
                  ? Array.from({ length: chartDataForModal.ys.length }, (_, i) => i)
                  : []
            ).map((seriesIndex) => {
              const names = chartDataForModal?.seriesNames ?? chartDataForModal?.ys?.map((_, i) => `Series ${i}`) ?? []
              const name = names[seriesIndex] ?? `Series ${seriesIndex}`
              return (
                <PointMarkModalButton
                  key={seriesIndex}
                  variant="contained"
                  onClick={() => handleSeriesPick(seriesIndex)}
                >
                  {name}
                </PointMarkModalButton>
              )
            })}
          </PointMarkModalButtons>
          <PointMarkModalCancel variant="outlined" onClick={closeSeriesPicker}>
            Cancel
          </PointMarkModalCancel>
        </Box>
      </PointMarkModalOverlay>
    </ChartComparison>
    </ChartThemeProvider>
  )
}

export default App
