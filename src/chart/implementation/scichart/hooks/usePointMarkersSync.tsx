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

import type { ChartIcon } from '../../../types'
import { toSvgString } from '../../../utils/iconUtils'
import { DEFAULT_POINT_MARK_ICON_SVG } from '../../../../assets/pointMarkIcon'

const DEFAULT_ICON_SIZE = 1
const DEFAULT_ICON_PX_BASE = 24
const DEFAULT_FONT_SIZE_BASE = 20
const DEFAULT_ICON_COLOR = '#3388ff'

export interface UsePointMarkersSyncOptions {
  icons?: ChartIcon[]
  defaultIcon?: string
  defaultColor?: string
  iconSize?: number
}

export function usePointMarkersSync({
  icons = [],
  defaultIcon = DEFAULT_POINT_MARK_ICON_SVG,
  defaultColor = DEFAULT_ICON_COLOR,
  iconSize = DEFAULT_ICON_SIZE,
}: UsePointMarkersSyncOptions = {}) {
  const initResult = useContext(SciChartSurfaceContext)
  const annotationRefs = useRef<(CustomAnnotation | NativeTextAnnotation)[]>([])

  useEffect(() => {
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined
    if (!surface) return

    const chartSurface = surface as SciChartSurface
    const iconsToRender: ChartIcon[] = [...icons]

    for (const annotationRef of annotationRefs.current) {
      chartSurface.annotations.remove(annotationRef)
      annotationRef.delete()
    }
    annotationRefs.current = []

    const iconPx = Math.round(DEFAULT_ICON_PX_BASE * iconSize)

    for (const icon of iconsToRender) {
      const { x, y } = icon.location
      const color = icon.color ?? defaultColor
      const isSvg = icon.iconImage.startsWith('<')
      const annotation = isSvg
        ? new CustomAnnotation({
            x1: x,
            y1: y,
            xCoordinateMode: ECoordinateMode.DataValue,
            yCoordinateMode: ECoordinateMode.DataValue,
            horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
            verticalAnchorPoint: EVerticalAnchorPoint.Center,
            svgString: toSvgString(icon.iconImage, iconPx, color),
          })
        : new NativeTextAnnotation({
            x1: x,
            y1: y,
            xCoordinateMode: ECoordinateMode.DataValue,
            yCoordinateMode: ECoordinateMode.DataValue,
            text: icon.iconImage,
            textColor: color,
            fontSize: Math.round(DEFAULT_FONT_SIZE_BASE * iconSize),
            horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
            verticalAnchorPoint: EVerticalAnchorPoint.Center,
          })
      chartSurface.annotations.add(annotation)
      annotationRefs.current.push(annotation)
    }

    chartSurface.invalidateElement()

    return () => {
      for (const annotationRef of annotationRefs.current) {
        chartSurface.annotations.remove(annotationRef)
        annotationRef.delete()
      }
      annotationRefs.current = []
    }
  }, [initResult, icons, defaultIcon, defaultColor, iconSize])
}

interface PointMarkersSyncProps {
  icons?: ChartIcon[]
  defaultIcon?: string
  defaultColor?: string
  iconSize?: number
}

export const PointMarkersSync = ({
  icons = [],
  defaultIcon = DEFAULT_POINT_MARK_ICON_SVG,
  defaultColor = DEFAULT_ICON_COLOR,
  iconSize = DEFAULT_ICON_SIZE,
}: PointMarkersSyncProps) => {
  usePointMarkersSync({ icons, defaultIcon, defaultColor, iconSize })
  return null
}
