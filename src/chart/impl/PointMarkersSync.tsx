import { useContext, useEffect, useRef } from 'react'
import {
  ECoordinateMode,
  EHorizontalAnchorPoint,
  EVerticalAnchorPoint,
  HtmlCustomAnnotation,
  NativeTextAnnotation,
  SciChartSurface,
} from 'scichart'
import { SciChartSurfaceContext } from 'scichart-react'

import type { ChartIcon } from '../types'

interface PointMarker {
  x: number
  y: number
  icon?: string
  color?: string
}

function toIconContent(iconImage: string, color?: string): string {
  if (iconImage.startsWith('<')) return iconImage
  if (/^https?:\/\//.test(iconImage) || /\.(png|jpg|svg|gif)(\?|$)/i.test(iconImage)) {
    return `<img src="${iconImage}" style="width:100%;height:100%;object-fit:contain" alt="" />`
  }
  // Character fallback (● etc): render as SVG circle for reliable cross-browser display
  const c = color ?? '#3388ff'
  return `<svg width="100%" height="100%" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><circle cx="12" cy="12" r="8" fill="${c}"/></svg>`
}

interface PointMarkersSyncProps {
  icons?: ChartIcon[]
  pointMarkers?: PointMarker[]
  defaultIcon?: string
  defaultColor?: string
}

export function PointMarkersSync({
  icons = [],
  pointMarkers = [],
  defaultIcon = '📍',
  defaultColor = '#3388ff',
}: PointMarkersSyncProps) {
  const initResult = useContext(SciChartSurfaceContext)
  const annotationRefs = useRef<(HtmlCustomAnnotation | NativeTextAnnotation)[]>([])

  useEffect(() => {
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined
    if (!surface) return

    const xAxis = (surface as SciChartSurface).xAxes.get(0)
    const yAxis = (surface as SciChartSurface).yAxes.get(0)
    const xRange = xAxis?.visibleRange
    const yRange = yAxis?.visibleRange
    const xSpan = xRange ? xRange.diff : 1
    const ySpan = yRange ? yRange.diff : 1
    const deltaX = xSpan * 0.06
    const deltaY = ySpan * 0.06

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

    for (const icon of merged) {
      const { x, y } = icon.location
      const color = icon.color ?? defaultColor
      // Use NativeTextAnnotation (same as PointMarkModifier) for correct positioning
      const isSvgOrUrl = icon.iconImage.startsWith('<') || /^https?:\/\//.test(icon.iconImage) || /\.(png|jpg|svg|gif)(\?|$)/i.test(icon.iconImage)
      const ann = isSvgOrUrl
        ? (() => {
            const content = toIconContent(icon.iconImage, color)
            const a = new HtmlCustomAnnotation({
              x1: x,
              x2: x + deltaX,
              y1: y,
              y2: y + deltaY,
              xCoordinateMode: ECoordinateMode.DataValue,
              yCoordinateMode: ECoordinateMode.DataValue,
              horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
              verticalAnchorPoint: EVerticalAnchorPoint.Center,
            })
            a.htmlElement.style.width = '100%'
            a.htmlElement.style.height = '100%'
            a.htmlElement.style.display = 'flex'
            a.htmlElement.style.alignItems = 'center'
            a.htmlElement.style.justifyContent = 'center'
            a.htmlElement.style.pointerEvents = 'none'
            a.htmlElement.innerHTML = content
            return a
          })()
        : new NativeTextAnnotation({
            x1: x,
            x2: x + deltaX,
            y1: y,
            y2: y + deltaY,
            xCoordinateMode: ECoordinateMode.DataValue,
            yCoordinateMode: ECoordinateMode.DataValue,
            text: icon.iconImage,
            textColor: color,
            fontSize: 20,
            horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
            verticalAnchorPoint: EVerticalAnchorPoint.Center,
            scaleOnResize: true,
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
  }, [initResult, icons, pointMarkers, defaultIcon, defaultColor])

  return null
}
