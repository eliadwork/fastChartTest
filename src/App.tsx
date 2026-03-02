import { useEffect, useState } from 'react'
import { SciChartSurface } from 'scichart'
import { ChartWrapper } from './ChartWrapper'
import type { GenericChartData } from './chartTypes'
import './App.css'

const POINTS_PER_SERIES = 500_000
const SERIES_COUNT = 10

// Load WASM from CDN (no build config required)
SciChartSurface.loadWasmFromCDN()

function App() {
  const [chartData, setChartData] = useState<GenericChartData | null>(null)

  useEffect(() => {
    const worker = new Worker(new URL('./dataWorker.js', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = ({ data: { x, ys } }) => {
      setChartData({
        x: new Float64Array(x),
        ys: ys.map((b: ArrayBuffer) => new Float64Array(b)),
      })
      worker.terminate()
    }
    worker.postMessage({ count: POINTS_PER_SERIES, seriesCount: SERIES_COUNT })
    return () => worker.terminate()
  }, [])

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
            }}
          />
        ) : (
          <div className="chart-placeholder">Loading data...</div>
        )}
      </div>
    </div>
  )
}

export default App
