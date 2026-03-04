import { useCallback, useContext, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { SciChartSurface } from 'scichart'
import { SciChartSurfaceContext } from 'scichart-react'

interface SeriesInfo {
  name: string
  stroke: string
  strokeDashArray?: number[]
  strokeThickness: number
  isVisible: boolean
  index: number
}

interface LegendSyncProps {
  backgroundColor?: string
  textColor?: string
  /** When provided, triggers re-render after SeriesVisibilitySync (e.g. "disable all") updates the chart. */
  seriesVisibility?: boolean[]
  /** Group key per series (parallel to series). Same key = grouped together, toggle on/off as one. */
  seriesGroupKeys?: (string | undefined)[]
  onSeriesVisibilityChange?: (index: number, visible: boolean) => void
  onSeriesVisibilityGroupChange?: (indices: number[], visible: boolean) => void
}

function LegendLine({
  stroke,
  strokeThickness,
  strokeDashArray,
}: {
  stroke: string
  strokeThickness: number
  strokeDashArray?: number[]
}) {
  return (
    <svg width="1.25em" height="0.5em" viewBox="0 0 20 8" style={{ flexShrink: 0 }}>
      <line
        x1="0"
        y1="4"
        x2="20"
        y2="4"
        stroke={stroke}
        strokeWidth={strokeThickness}
        strokeDasharray={strokeDashArray?.join(' ') ?? 'none'}
      />
    </svg>
  )
}

export function LegendSync({
  backgroundColor,
  textColor,
  seriesVisibility,
  seriesGroupKeys,
  onSeriesVisibilityChange,
  onSeriesVisibilityGroupChange,
}: LegendSyncProps) {
  const initResult = useContext(SciChartSurfaceContext)
  const [, forceUpdate] = useState(0)

  const surface = initResult?.sciChartSurface as SciChartSurface | undefined

  // Re-render after SeriesVisibilitySync runs (e.g. when "disable all" changes)
  useEffect(() => {
    const id = requestAnimationFrame(() => forceUpdate((n) => n + 1))
    return () => cancelAnimationFrame(id)
  }, [seriesVisibility])

  const seriesList: SeriesInfo[] = []

  if (surface) {
    const arr = surface.renderableSeries.asArray()
    for (let i = 0; i < arr.length; i++) {
      const rs = arr[i] as {
        stroke: string
        strokeThickness?: number
        strokeDashArray?: number[]
        isVisible: boolean
        dataSeries?: { dataSeriesName?: string }
      }
      const name = rs.dataSeries?.dataSeriesName ?? `Series ${i}`
      seriesList.push({
        name,
        stroke: rs.stroke ?? '#888',
        strokeDashArray: rs.strokeDashArray,
        strokeThickness: rs.strokeThickness ?? 2,
        isVisible: rs.isVisible,
        index: i,
      })
    }
  }

  const handleClick = useCallback(
    (index: number) => {
      if (!surface) return
      const series = surface.renderableSeries.asArray()[index] as { isVisible: boolean }
      if (!series) return
      const newVal = !series.isVisible
      series.isVisible = newVal
      surface.invalidateElement()
      onSeriesVisibilityChange?.(index, newVal)
      forceUpdate((n) => n + 1)
    },
    [surface, onSeriesVisibilityChange]
  )

  const handleGroupClick = useCallback(
    (indices: number[]) => {
      if (!surface) return
      const arr = surface.renderableSeries.asArray()
      const anyVisible = indices.some((i) => (arr[i] as { isVisible: boolean })?.isVisible)
      const newVal = !anyVisible
      for (const i of indices) {
        const s = arr[i] as { isVisible: boolean }
        if (s) s.isVisible = newVal
      }
      surface.invalidateElement()
      onSeriesVisibilityGroupChange?.(indices, newVal)
      forceUpdate((n) => n + 1)
    },
    [surface, onSeriesVisibilityGroupChange]
  )

  if (seriesList.length === 0) return null

  // Build groups from seriesGroupKeys: same key → same group
  const groups: { name: string; seriesIndices: number[] }[] = []
  const seenKeys = new Map<string, number>() // key → index in groups
  const groupedIndices = new Set<number>()
  for (let i = 0; i < seriesList.length; i++) {
    const key = seriesGroupKeys?.[i]
    if (key != null && key !== '') {
      groupedIndices.add(i)
      const idx = seenKeys.get(key)
      if (idx !== undefined) {
        groups[idx]!.seriesIndices.push(i)
      } else {
        seenKeys.set(key, groups.length)
        groups.push({ name: key, seriesIndices: [i] })
      }
    }
  }
  const ungrouped = seriesList.filter((s) => !groupedIndices.has(s.index))

  const itemSx = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.15rem 0',
    border: 'none',
    background: 'none',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
    textAlign: 'left' as const,
    '&:hover': { opacity: 1, textDecoration: 'none' },
  }

  return (
    <Box
      component="div"
      sx={{
        position: 'absolute',
        top: '0.5rem',
        left: '0.5rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        padding: '0.4rem 0.6rem',
        borderRadius: '0.25rem',
        maxHeight: '90%',
        overflowY: 'auto',
        backgroundColor: backgroundColor ?? 'rgba(0,0,0,0.6)',
        color: textColor ?? '#ffffff',
        fontSize: '0.8rem',
        pointerEvents: 'auto',
      }}
    >
      {groups.map((group) => {
        const items = group.seriesIndices
          .map((i) => seriesList[i])
          .filter(Boolean)
        if (items.length === 0) return null
        const allVisible = items.every((s) => s.isVisible)
        const first = items[0]!
        return (
          <Box key={group.name} sx={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <Box
              component="button"
              type="button"
              onClick={() => handleGroupClick(group.seriesIndices)}
              sx={{
                ...itemSx,
                opacity: allVisible ? 1 : 0.5,
                textDecoration: allVisible ? 'none' : 'line-through',
              }}
            >
              <LegendLine
                stroke={first.stroke}
                strokeThickness={first.strokeThickness}
                strokeDashArray={first.strokeDashArray}
              />
              <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {group.name}
              </Box>
            </Box>
            {items.map((s) => (
              <Box
                component="button"
                key={s.index}
                type="button"
                onClick={() => handleClick(s.index)}
                sx={{
                  ...itemSx,
                  pl: '1.5rem',
                  opacity: s.isVisible ? 1 : 0.5,
                  textDecoration: s.isVisible ? 'none' : 'line-through',
                }}
              >
                <LegendLine
                  stroke={s.stroke}
                  strokeThickness={s.strokeThickness}
                  strokeDashArray={s.strokeDashArray}
                />
                <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.name}
                </Box>
              </Box>
            ))}
          </Box>
        )
      })}
      {ungrouped.map((s) => (
        <Box
          component="button"
          key={s.index}
          type="button"
          onClick={() => handleClick(s.index)}
          sx={{
            ...itemSx,
            opacity: s.isVisible ? 1 : 0.5,
            textDecoration: s.isVisible ? 'none' : 'line-through',
          }}
        >
          <LegendLine
            stroke={s.stroke}
            strokeThickness={s.strokeThickness}
            strokeDashArray={s.strokeDashArray}
          />
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.name}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
