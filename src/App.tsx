import { useCallback, useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import { SciChartSurface } from 'scichart'
import { ChartWrapper } from './ChartWrapper'
import type { GenericChartData } from './chartTypes'
import { usePointMarkStore } from './store/pointMarkStore'
import './App.css'

const POINTS_PER_SERIES = 500_000
const SERIES_COUNT = 10

// Load WASM from CDN (no build config required)
SciChartSurface.loadWasmFromCDN()

function findNearestPoint(
  x: ArrayLike<number>,
  y: ArrayLike<number>,
  xTarget: number
): { x: number; y: number } {
  const n = x.length
  if (n === 0) return { x: NaN, y: NaN }
  if (xTarget <= x[0]) return { x: Number(x[0]), y: Number(y[0]) }
  if (xTarget >= x[n - 1]) return { x: Number(x[n - 1]), y: Number(y[n - 1]) }

  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (x[mid] <= xTarget) lo = mid
    else hi = mid
  }
  const x0 = Number(x[lo])
  const x1 = Number(x[hi])
  const dist0 = Math.abs(xTarget - x0)
  const dist1 = Math.abs(xTarget - x1)
  const idx = dist0 <= dist1 ? lo : hi
  return { x: Number(x[idx]), y: Number(y[idx]) }
}

function App() {
  const [chartData, setChartData] = useState<GenericChartData | null>(null)
  const { enqueueSnackbar } = useSnackbar()
  const seriesPickerOpen = usePointMarkStore((s) => s.seriesPickerOpen)
  const markedXValues = usePointMarkStore((s) => s.markedXValues)
  const chartDataForModal = usePointMarkStore((s) => s.chartDataForModal)
  const addPointMark = usePointMarkStore((s) => s.addPointMark)
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
    (xValue: number) => {
      if (!chartData) return null
      const chartDataForStore = {
        x: chartData.x,
        ys: chartData.ys ?? (chartData.series ?? []),
        seriesNames: chartData.seriesNames,
      }
      return addPointMark('resampled', xValue, chartDataForStore)
    },
    [chartData, addPointMark]
  )

  const handleNoLossPointMark = useCallback(
    (xValue: number) => {
      if (!chartData) return null
      const chartDataForStore = {
        x: chartData.x,
        ys: chartData.ys ?? (chartData.series ?? []),
        seriesNames: chartData.seriesNames,
      }
      return addPointMark('no-loss', xValue, chartDataForStore)
    },
    [chartData, addPointMark]
  )

  const handleSeriesPick = useCallback(
    (seriesIndex: number) => {
      if (!markedXValues || !chartDataForModal) return
      const middleX = markedXValues[1]
      const yValues = chartDataForModal.ys[seriesIndex]
      if (!yValues) return
      const { x, y } = findNearestPoint(chartDataForModal.x, yValues, middleX)
      const seriesName =
        chartDataForModal.seriesNames?.[seriesIndex] ?? `Series ${seriesIndex}`
      enqueueSnackbar(`Y at nearest point (${x}): ${y} (${seriesName})`, {
        autoHideDuration: 60000,
      })
      closeSeriesPicker()
    },
    [markedXValues, chartDataForModal, enqueueSnackbar, closeSeriesPicker]
  )

  const sharedOptions = {
    shapes: [{ color: '#ff0000', axis: 'x' as const, value: 100 }],
  }

  return (
    <div className="chart-comparison">
      <div className="chart-panel">
        <h3>Resampled (precision 1.0)</h3>
        {chartData ? (
          <ChartWrapper
            data={chartData}
            options={{
              ...sharedOptions,
              resampling: true,
              resamplingPrecision: 1,
              onPointMark: handleResampledPointMark,
            }}
          />
        ) : (
          <div className="chart-placeholder">Loading data...</div>
        )}
      </div>
      <div className="chart-panel">
        <h3>No-loss (every point)</h3>
        {chartData ? (
          <ChartWrapper
            data={chartData}
            options={{
              ...sharedOptions,
              resampling: false,
              onPointMark: handleNoLossPointMark,
            }}
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
