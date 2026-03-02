import { useContext, useEffect, useRef } from 'react'
import {
  CustomAnnotation,
  ECoordinateMode,
  EHorizontalAnchorPoint,
  EVerticalAnchorPoint,
  NativeTextAnnotation,
  SciChartSurface,
} from 'scichart'
import { SciChartSurfaceContext } from 'scichart-react'

import type { ChartIcon } from '../types'
import { DEFAULT_POINT_MARK_ICON_SVG } from '../../chartTheme'
import { toSvgString } from './iconUtils'

interface PointMarker {
  x: number
  y: number
  icon?: string
  color?: string
}

interface PointMarkersSyncProps {
  icons?: ChartIcon[]
  pointMarkers?: PointMarker[]
  defaultIcon?: string
  defaultColor?: string
  /** Icon size multiplier. 1 = default, 1.5 = 50% bigger. */
  iconSize?: number
}

const DEFAULT_ICON_SIZE = 1

export function PointMarkersSync({
  icons = [],
  pointMarkers = [],
  defaultIcon = DEFAULT_POINT_MARK_ICON_SVG,
  defaultColor = '#3388ff',
  iconSize = DEFAULT_ICON_SIZE,
}: PointMarkersSyncProps) {
  const initResult = useContext(SciChartSurfaceContext)
  const annotationRefs = useRef<(CustomAnnotation | NativeTextAnnotation)[]>([])

  useEffect(() => {
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined
    if (!surface) return

    const merged: ChartIcon[] = [
      ...icons,
      ...pointMarkers.map((m) => ({
        iconImage: m.icon ?? defaultIcon,
        location: { x: m.x, y: m.y },
        color: m.color ?? defaultColor,
      })),
    ]

    const surf = surface as SciChartSurface
    for (const ref of annotationRefs.current) {
      surf.annotations.remove(ref)
      ref.delete()
    }
    annotationRefs.current = []

    const px = Math.round(24 * iconSize)

    for (const icon of merged) {
      const { x, y } = icon.location
      const color = icon.color ?? defaultColor
      const isSvg = icon.iconImage.startsWith('<')
      const ann = isSvg
        ? new CustomAnnotation({
            x1: x,
            y1: y,
            xCoordinateMode: ECoordinateMode.DataValue,
            yCoordinateMode: ECoordinateMode.DataValue,
            horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
            verticalAnchorPoint: EVerticalAnchorPoint.Center,
            svgString: toSvgString(icon.iconImage, px, color),
          })
        : new NativeTextAnnotation({
            x1: x,
            y1: y,
            xCoordinateMode: ECoordinateMode.DataValue,
            yCoordinateMode: ECoordinateMode.DataValue,
            text: icon.iconImage,
            textColor: color,
            fontSize: Math.round(20 * iconSize),
            horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
            verticalAnchorPoint: EVerticalAnchorPoint.Center,
          })
      surf.annotations.add(ann)
      annotationRefs.current.push(ann)
    }

    surf.invalidateElement()

    return () => {
      for (const ref of annotationRefs.current) {
        surf.annotations.remove(ref)
        ref.delete()
      }
      annotationRefs.current = []
    }
  }, [initResult, icons, pointMarkers, defaultIcon, defaultColor, iconSize])

  return null
}
