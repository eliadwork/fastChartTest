import { useCallback, useContext, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useTheme } from '@mui/material/styles'
import { useSnackbar } from 'notistack'
import { DEFAULT_POINT_MARK_ICON_SVG } from './chartTheme'
import { ChartThemeProvider } from './ChartThemeContext'
import { ChartWrapper } from './ChartWrapper'
import type { ChartData } from './chart'
import { PointMarkClearContext, PointMarkClearProvider } from './PointMarkClearContext'
import { usePointMarkStore } from './store/pointMarkStore'
import type { PointMarkColor } from './store/pointMarkStore'
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

function App() {
  const theme = useTheme()
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const { enqueueSnackbar } = useSnackbar()
  const { removeLastPendingForChart, clearPendingStateForChart } = useContext(PointMarkClearContext)
  const seriesPickerOpen = usePointMarkStore((s) => s.seriesPickerOpen)
  const markedXValues = usePointMarkStore((s) => s.markedXValues)
  const markedPoints = usePointMarkStore((s) => s.markedPoints)
  const chartDataForModal = usePointMarkStore((s) => s.chartDataForModal)
  const chartIdForModal = usePointMarkStore((s) => s.chartIdForModal)
  const bindableIndices = usePointMarkStore((s) => s.bindableIndices)
  const addPointMark = usePointMarkStore((s) => s.addPointMark)
  const addIcon = usePointMarkStore((s) => s.addIcon)
  const iconsByChart = usePointMarkStore((s) => s.iconsByChart)
  const updateMarkedPointColor = usePointMarkStore((s) => s.updateMarkedPointColor)
  const closeSeriesPicker = usePointMarkStore((s) => s.closeSeriesPicker)
  const cancelSeriesPickerWithoutChoice = usePointMarkStore((s) => s.cancelSeriesPickerWithoutChoice)

  const COLORS: PointMarkColor[] = ['red', 'green', 'yellow']
  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState<number>(-1)

  const seriesOptions =
    bindableIndices.length > 0
      ? bindableIndices
      : chartDataForModal?.seriesNames
        ? Array.from({ length: chartDataForModal.seriesNames.length }, (_, i) => i)
        : chartDataForModal?.ys
          ? Array.from({ length: chartDataForModal.ys.length }, (_, i) => i)
          : []
  const seriesNames = chartDataForModal?.seriesNames ?? chartDataForModal?.ys?.map((_, i) => `Series ${i}`) ?? []

  useEffect(() => {
    if (seriesPickerOpen && seriesOptions.length > 0) {
      setSelectedSeriesIndex((prev) =>
        seriesOptions.includes(prev) ? prev : (seriesOptions[0] ?? -1)
      )
    }
  }, [seriesPickerOpen, seriesOptions])

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
          onValidationError: (msg) => enqueueSnackbar(msg, { variant: 'error' }),
          onComplete: (cid) => clearPendingStateForChart(cid),
        })
      },
    [chartData, addPointMark, enqueueSnackbar, clearPendingStateForChart]
  )

  const handleSeriesPick = useCallback(
    (seriesIndex: number) => {
      if (!markedPoints || !markedXValues || !chartDataForModal || !chartIdForModal) return
      const [x1, x2, x3] = markedXValues
      const leftPoint = getInterpolatedPointAtX(chartDataForModal, x1, seriesIndex)
      const middlePoint = getInterpolatedPointAtX(chartDataForModal, x2, seriesIndex)
      const rightPoint = getInterpolatedPointAtX(chartDataForModal, x3, seriesIndex)
      if (!leftPoint || !middlePoint || !rightPoint) return
      const finalPoints = [
        { location: leftPoint },
        { location: middlePoint, ...(markedPoints[1]?.color != null && { color: markedPoints[1].color }) },
        { location: rightPoint },
      ]
      addIcon(chartIdForModal, {
        iconImage: DEFAULT_POINT_MARK_ICON_SVG,
        location: middlePoint,
        color: markedPoints[1]?.color
          ? { red: '#ff0000', green: '#00ff00', yellow: '#ffff00' }[markedPoints[1].color]
          : undefined,
      })
      const output = finalPoints.map((p) =>
        'color' in p && p.color != null ? { location: p.location, color: p.color } : { location: p.location }
      )
      console.log(JSON.stringify(output, null, 2))
      enqueueSnackbar(`Saved 3 points`, { autoHideDuration: 3000 })
      clearPendingStateForChart(chartIdForModal)
      closeSeriesPicker()
    },
    [
      markedPoints,
      markedXValues,
      chartDataForModal,
      chartIdForModal,
      addIcon,
      enqueueSnackbar,
      closeSeriesPicker,
      clearPendingStateForChart,
    ]
  )

  const canConfirm = selectedSeriesIndex >= 0 && markedPoints?.[1]?.color != null

  const handleDone = useCallback(() => {
    if (canConfirm) {
      handleSeriesPick(selectedSeriesIndex)
    }
  }, [canConfirm, selectedSeriesIndex, handleSeriesPick])

  const handleCloseWithoutChoice = useCallback(() => {
    if (chartIdForModal) {
      removeLastPendingForChart(chartIdForModal)
      cancelSeriesPickerWithoutChoice(chartIdForModal)
      enqueueSnackbar('Please select a series and color before confirming.', { variant: 'error' })
    }
  }, [chartIdForModal, removeLastPendingForChart, cancelSeriesPickerWithoutChoice, enqueueSnackbar])

  useEffect(() => {
    if (!seriesPickerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleDone()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seriesPickerOpen, handleDone])

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
        color: '#00ff00',
        axis: 'x' as const,
        value: 350000,
      },
      {
        shape: 'box' as const,
        name: 'Target Region',
        color: '#00BFFF',
        coordinates: { x1: 100000, x2: 150000, y1: 0, y2: 1000 },
      },
      {
        shape: 'box' as const,
        name: 'Full-height band',
        color: '#FFA500',
        fill: '#FFA50022',
        coordinates: { x1: 250000, x2: 300000 },
      },
    ],
  }

  return (
    <PointMarkClearProvider>
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
        onClose={handleCloseWithoutChoice}
      >
        <Box component="div" onClick={(e: React.MouseEvent) => e.stopPropagation()} sx={{ p: 2, maxWidth: '90vw' }}>
          <PointMarkModalTitle variant="h6">
            Which series should the middle point be connected to?
          </PointMarkModalTitle>
          {markedPoints && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ minWidth: 90, fontSize: '0.9rem' }}>
                Middle point color:
              </Box>
              {COLORS.map((c) => (
                <PointMarkModalButton
                  key={c}
                  variant={markedPoints[1]?.color === c ? 'contained' : 'outlined'}
                  onClick={() => updateMarkedPointColor(1, c)}
                  size="small"
                  sx={{
                    backgroundColor: markedPoints[1]?.color === c ? c : undefined,
                    borderColor: c,
                    color: markedPoints[1]?.color === c ? '#fff' : c,
                    minWidth: 70,
                  }}
                >
                  {c}
                </PointMarkModalButton>
              ))}
            </Box>
          )}
          <FormControl fullWidth sx={{ mb: 2, minWidth: 200 }}>
            <InputLabel id="series-select-label">Series</InputLabel>
            <Select
              labelId="series-select-label"
              label="Series"
              value={selectedSeriesIndex >= 0 ? selectedSeriesIndex : ''}
              onChange={(e) => setSelectedSeriesIndex(Number(e.target.value))}
            >
              {seriesOptions.map((seriesIndex) => (
                <MenuItem key={seriesIndex} value={seriesIndex}>
                  {seriesNames[seriesIndex] ?? `Series ${seriesIndex}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <PointMarkModalButtons>
            <PointMarkModalButton
              variant="contained"
              onClick={handleDone}
              disabled={!canConfirm}
              autoFocus
            >
              Done
            </PointMarkModalButton>
            <PointMarkModalCancel variant="outlined" onClick={handleCloseWithoutChoice}>
              Cancel
            </PointMarkModalCancel>
          </PointMarkModalButtons>
        </Box>
      </PointMarkModalOverlay>
    </ChartComparison>
    </ChartThemeProvider>
    </PointMarkClearProvider>
  )
}

export default App
