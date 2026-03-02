import { useCallback, useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import { SciChartSurface } from 'scichart'
import { ChartWrapper } from './ChartWrapper'
import type { ChartData } from './chart'
import { usePointMarkStore } from './store/pointMarkStore'
import { getInterpolatedPointAtX } from './utils/chartDataLookup'
import './App.css'

const POINTS_PER_SERIES = 500_000
const SERIES_COUNT = 10

// Load WASM from CDN (no build config required)
SciChartSurface.loadWasmFromCDN()

function App() {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const { enqueueSnackbar } = useSnackbar()
  const seriesPickerOpen = usePointMarkStore((s) => s.seriesPickerOpen)
  const markedXValues = usePointMarkStore((s) => s.markedXValues)
  const markedYValue = usePointMarkStore((s) => s.markedYValue)
  const chartDataForModal = usePointMarkStore((s) => s.chartDataForModal)
  const chartIdForModal = usePointMarkStore((s) => s.chartIdForModal)
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

  const handleResampledPointMark = useCallback(
    (xValue: number, yValue: number) => {
      if (!chartData) return null
      const chartDataForStore = {
        x: chartData.x,
        ys: chartData.ys ?? (chartData.series ?? []),
        seriesNames: chartData.seriesNames,
      }
      return addPointMark('resampled', xValue, yValue, chartDataForStore)
    },
    [chartData, addPointMark]
  )

  const handleNoLossPointMark = useCallback(
    (xValue: number, yValue: number) => {
      if (!chartData) return null
      const chartDataForStore = {
        x: chartData.x,
        ys: chartData.ys ?? (chartData.series ?? []),
        seriesNames: chartData.seriesNames,
      }
      return addPointMark('no-loss', xValue, yValue, chartDataForStore)
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
        iconImage: '●',
        location: { x: point.x, y: point.y },
        color: '#888888',
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

  const sharedOptions = {
    pointMarkIcon: '●',
    pointMarkIconColor: '#888888',
    seriesLines: [
      {},
      {},
      { thickness: 4 },
      { thickness: 1, striped: true },
    ],
    shapes: [
      { color: '#ff0000', axis: 'x' as const, value: 100 },
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
    <div className="chart-comparison">
      <div className="chart-panel">
        <h3>Resampled (precision 1.0)</h3>
        {chartData ? (
          <ChartWrapper
            chartId="resampled"
            data={chartData}
            options={{
              ...sharedOptions,
              resampling: true,
              resamplingPrecision: 1,
              onPointMark: handleResampledPointMark,
            }}
            icons={iconsByChart['resampled']}
          />
        ) : (
          <div className="chart-placeholder">Loading data...</div>
        )}
      </div>
      <div className="chart-panel">
        <h3>No-loss (every point)</h3>
        {chartData ? (
          <ChartWrapper
            chartId="no-loss"
            data={chartData}
            options={{
              ...sharedOptions,
              resampling: false,
              onPointMark: handleNoLossPointMark,
            }}
            icons={iconsByChart['no-loss']}
          />
        ) : (
          <div className="chart-placeholder">Loading data...</div>
        )}
      </div>

      {seriesPickerOpen && chartDataForModal && (
        <div className="point-mark-modal-overlay" onClick={closeSeriesPicker}>
          <div
            className="point-mark-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Which series should the middle point be connected to?</h4>
            <div className="point-mark-modal-buttons">
              {(chartDataForModal.seriesNames ?? chartDataForModal.ys.map((_, i) => `Series ${i}`)).map(
                (name, i) => (
                  <button
                    key={i}
                    onClick={() => handleSeriesPick(i)}
                    className="point-mark-modal-btn"
                  >
                    {name}
                  </button>
                )
              )}
            </div>
            <button onClick={closeSeriesPicker} className="point-mark-modal-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
