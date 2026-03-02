import { useCallback, useContext, useState } from 'react'
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
  /** When provided (e.g. from "disable all"), used for display; otherwise read from chart. */
  seriesVisibility?: boolean[]
}

export function LegendSync({ backgroundColor, textColor, seriesVisibility }: LegendSyncProps) {
  const initResult = useContext(SciChartSurfaceContext)
  const [, forceUpdate] = useState(0)

  const surface = initResult?.sciChartSurface as SciChartSurface | undefined
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
      const isVisible = seriesVisibility ? (seriesVisibility[i] ?? true) : rs.isVisible
      seriesList.push({
        name,
        stroke: rs.stroke ?? '#888',
        strokeDashArray: rs.strokeDashArray,
        strokeThickness: rs.strokeThickness ?? 2,
        isVisible,
        index: i,
      })
    }
  }

  const handleClick = useCallback(
    (index: number) => {
      if (!surface) return
      const series = surface.renderableSeries.asArray()[index] as { isVisible: boolean }
      if (!series) return
      series.isVisible = !series.isVisible
      surface.invalidateElement()
      forceUpdate((n) => n + 1)
    },
    [surface]
  )

  if (seriesList.length === 0) return null

  return (
    <Box
      component="div"
      sx={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        padding: '0.4rem 0.6rem',
        borderRadius: 4,
        backgroundColor: backgroundColor ?? 'rgba(0,0,0,0.6)',
        color: textColor ?? '#ffffff',
        fontSize: '0.8rem',
        pointerEvents: 'auto',
      }}
    >
      {seriesList.map((s) => (
        <Box
          component="button"
          key={s.index}
          type="button"
          onClick={() => handleClick(s.index)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.15rem 0',
            border: 'none',
            background: 'none',
            color: 'inherit',
            font: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
            opacity: s.isVisible ? 1 : 0.5,
            textDecoration: s.isVisible ? 'none' : 'line-through',
            '&:hover': {
              opacity: 1,
              textDecoration: 'none',
            },
          }}
        >
          <svg
            width="20"
            height="8"
            viewBox="0 0 20 8"
            style={{ flexShrink: 0 }}
          >
            <line
              x1="0"
              y1="4"
              x2="20"
              y2="4"
              stroke={s.stroke}
              strokeWidth={s.strokeThickness}
              strokeDasharray={s.strokeDashArray?.join(' ') ?? 'none'}
            />
          </svg>
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.name}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
