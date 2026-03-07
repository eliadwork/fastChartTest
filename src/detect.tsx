/**
 * Detect – Chart with 3-click point mark flow.
 * Uses Chart for header, legend, zoom controls. Adds point mark modal only.
 */

import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useSnackbar } from 'notistack'
import { Chart } from './chart'
import type { ChartData } from './chart'
import { getInterpolatedPointAtX } from './utils/chartDataLookup'
import { usePointMarkStore } from './store/pointMarkStore'
import type { PointMarkColor } from './store/pointMarkStore'
import { PointMarkClearContext } from './PointMarkClearContext'
import {
  PointMarkModalOverlay,
  PointMarkModalTitle,
  PointMarkModalButtons,
  PointMarkModalButton,
  PointMarkModalCancel,
} from './styled'
import { DEFAULT_POINT_MARK_ICON_SVG } from './assets/pointMarkIcon'
import type { ChartImplementationStyle, ChartOptionsInput } from './chart'

const COLORS: PointMarkColor[] = ['red', 'green', 'yellow']

export interface DetectProps {
  chartId: string
  data: ChartData | null
  title?: string
  style: ChartImplementationStyle
  options?: ChartOptionsInput
  icons?: Array<{ iconImage: string; location: { x: number; y: number }; color?: string }>
}

export const Detect = ({
  chartId,
  data,
  title,
  style,
  options: opts = {},
  icons = [],
}: DetectProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const { removeLastPendingForChart, clearPendingStateForChart } = useContext(PointMarkClearContext)
  const chartIdForModal = usePointMarkStore((s) => s.chartIdForModal)
  const updateModalSeriesVisibility = usePointMarkStore((s) => s.updateModalSeriesVisibility)
  const seriesPickerOpen = usePointMarkStore((s) => s.seriesPickerOpen)
  const markedXValues = usePointMarkStore((s) => s.markedXValues)
  const markedPoints = usePointMarkStore((s) => s.markedPoints)
  const chartDataForModal = usePointMarkStore((s) => s.chartDataForModal)
  const bindableIndices = usePointMarkStore((s) => s.bindableIndices)
  const addPointMark = usePointMarkStore((s) => s.addPointMark)
  const addIcon = usePointMarkStore((s) => s.addIcon)
  const iconsByChart = usePointMarkStore((s) => s.iconsByChart)
  const updateMarkedPointColor = usePointMarkStore((s) => s.updateMarkedPointColor)
  const closeSeriesPicker = usePointMarkStore((s) => s.closeSeriesPicker)
  const cancelSeriesPickerWithoutChoice = usePointMarkStore((s) => s.cancelSeriesPickerWithoutChoice)

  const [selectedSeriesIndex, setSelectedSeriesIndex] = useState<number>(-1)

  const chartIcons = data ? [...icons, ...(iconsByChart[chartId] ?? [])] : []

  const createPointMarkHandler = useCallback(
    () =>
      (
        xValue: number,
        yValue: number,
        context?: { getSeriesVisibility: () => boolean[]; seriesBindable?: boolean[] }
      ) => {
        if (!data) return null
        const chartDataForStore = { lines: data }
        return addPointMark(chartId, xValue, yValue, chartDataForStore, {
          seriesBindable: context?.seriesBindable,
          seriesVisibility: context?.getSeriesVisibility?.(),
          onValidationError: (msg) => enqueueSnackbar(msg, { variant: 'error' }),
          onComplete: (cid) => clearPendingStateForChart(cid),
        })
      },
    [data, chartId, addPointMark, enqueueSnackbar, clearPendingStateForChart]
  )

  const options = useMemo(
    () =>
      ({
        ...opts,
        events: data
          ? { ...opts.events, onmiddleclick: createPointMarkHandler() }
          : opts.events,
      }) as ChartOptionsInput,
    [opts, data, createPointMarkHandler]
  )

  const handleSeriesVisibilityChange = useCallback(
    (visibility: boolean[]) => {
      if (chartId === chartIdForModal) {
        updateModalSeriesVisibility(visibility)
      }
    },
    [chartId, chartIdForModal, updateModalSeriesVisibility]
  )

  const modalLines = chartDataForModal?.lines ?? []
  const seriesOptions =
    bindableIndices.length > 0
      ? bindableIndices
      : Array.from({ length: modalLines.length }, (_, i) => i)
  const seriesNames = modalLines.map((l) => l.name)

  useEffect(() => {
    if (seriesPickerOpen && seriesOptions.length > 0) {
      setSelectedSeriesIndex((prev) =>
        seriesOptions.includes(prev) ? prev : (seriesOptions[0] ?? -1)
      )
    }
  }, [seriesPickerOpen, seriesOptions])

  const handleSeriesPick = useCallback(
    (seriesIndex: number) => {
      if (!markedPoints || !markedXValues || !chartDataForModal || !chartIdForModal) return
      const [x1, x2, x3] = markedXValues
      const leftPoint = getInterpolatedPointAtX(chartDataForModal, x1, seriesIndex)
      const middlePoint = getInterpolatedPointAtX(chartDataForModal, x2, seriesIndex)
      const rightPoint = getInterpolatedPointAtX(chartDataForModal, x3, seriesIndex)
      if (!leftPoint || !middlePoint || !rightPoint) return
      addIcon(chartIdForModal, {
        iconImage: DEFAULT_POINT_MARK_ICON_SVG,
        location: middlePoint,
        color: markedPoints[1]?.color
          ? { red: '#ff0000', green: '#00ff00', yellow: '#ffff00' }[markedPoints[1].color]
          : undefined,
      })
      const output = [
        { location: leftPoint },
        markedPoints[1]?.color != null
          ? { location: middlePoint, color: markedPoints[1].color }
          : { location: middlePoint },
        { location: rightPoint },
      ]
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

  return (
    <>
      <Chart
        data={data}
        chartId={chartId}
        title={title}
        options={options}
        chartStyle={style}
        icons={chartIcons}
        onSeriesVisibilityChange={handleSeriesVisibilityChange}
      />
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
              value={
                selectedSeriesIndex >= 0 && seriesOptions.includes(selectedSeriesIndex)
                  ? selectedSeriesIndex
                  : ''
              }
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
    </>
  )
}
