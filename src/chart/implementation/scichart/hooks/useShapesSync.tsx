import { useContext, useEffect, useRef } from 'react'
import {
  BoxAnnotation,
  ECoordinateMode,
  EHorizontalAnchorPoint,
  HorizontalLineAnnotation,
  NativeTextAnnotation,
  SciChartSurface,
  VerticalLineAnnotation,
} from 'scichart'
import { SciChartSurfaceContext } from 'scichart-react'

import type { ConvertedBox, ConvertedData, ConvertedShape } from '../convert'
import {
  SCI_CHART_BOX_DEFAULT_X1,
  SCI_CHART_BOX_DEFAULT_X2,
  SCI_CHART_BOX_DEFAULT_Y1,
  SCI_CHART_BOX_DEFAULT_Y2,
  SCI_CHART_BOX_FILL_OPACITY_SUFFIX,
  SCI_CHART_BOX_LABEL_FONT_SIZE,
  SCI_CHART_SHAPE_STROKE_THICKNESS,
} from '../sciChartWrapperConstants'

export interface UseShapesSyncOptions {
  lineShapes: ConvertedShape[]
  boxes: ConvertedBox[]
  data: ConvertedData
}

function computeDataBounds(data: ConvertedData): {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
} {
  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity
  for (const series of data.series) {
    for (let index = 0; index < series.x.length; index++) {
      const value = series.x[index]
      if (Number.isFinite(value)) {
        if (value < xMin) xMin = value
        if (value > xMax) xMax = value
      }
    }
    for (let index = 0; index < series.y.length; index++) {
      const value = series.y[index]
      if (Number.isFinite(value)) {
        if (value < yMin) yMin = value
        if (value > yMax) yMax = value
      }
    }
  }
  return { xMin, xMax, yMin, yMax }
}

export const useShapesSync = ({ lineShapes, boxes, data }: UseShapesSyncOptions) => {
  const initResult = useContext(SciChartSurfaceContext)
  const annotationRefs = useRef<
    (VerticalLineAnnotation | HorizontalLineAnnotation | BoxAnnotation | NativeTextAnnotation)[]
  >([])

  useEffect(() => {
    const surface = initResult?.sciChartSurface as SciChartSurface | undefined
    if (!surface) return

    const chartSurface = surface as SciChartSurface

    for (const annotationRef of annotationRefs.current) {
      chartSurface.annotations.remove(annotationRef)
      annotationRef.delete()
    }
    annotationRefs.current = []

    const { xMin, xMax, yMin, yMax } = computeDataBounds(data)
    const hasDataBounds = Number.isFinite(xMin) && Number.isFinite(yMin)

    for (const shape of lineShapes) {
      const annotation =
        shape.lineAxis === 'x'
          ? new VerticalLineAnnotation({
              x1: shape.lineValue,
              stroke: shape.color,
              strokeThickness: SCI_CHART_SHAPE_STROKE_THICKNESS,
              strokeDashArray: shape.strokeDashArray,
            })
          : new HorizontalLineAnnotation({
              y1: shape.lineValue,
              stroke: shape.color,
              strokeThickness: SCI_CHART_SHAPE_STROKE_THICKNESS,
              strokeDashArray: shape.strokeDashArray,
            })
      chartSurface.annotations.add(annotation)
      annotationRefs.current.push(annotation)
    }

    for (const box of boxes) {
      const bx1 = box.x1 ?? (hasDataBounds ? xMin : SCI_CHART_BOX_DEFAULT_X1)
      const bx2 = box.x2 ?? (hasDataBounds ? xMax : SCI_CHART_BOX_DEFAULT_X2)
      const by1 = box.y1 ?? (hasDataBounds ? yMin : SCI_CHART_BOX_DEFAULT_Y1)
      const by2 = box.y2 ?? (hasDataBounds ? yMax : SCI_CHART_BOX_DEFAULT_Y2)
      const useRelativeX = box.x1 == null && box.x2 == null && !hasDataBounds
      const useRelativeY = box.y1 == null && box.y2 == null && !hasDataBounds
      const boxAnnotation = new BoxAnnotation({
        x1: useRelativeX ? SCI_CHART_BOX_DEFAULT_X1 : bx1,
        x2: useRelativeX ? SCI_CHART_BOX_DEFAULT_X2 : bx2,
        y1: useRelativeY ? SCI_CHART_BOX_DEFAULT_Y1 : by1,
        y2: useRelativeY ? SCI_CHART_BOX_DEFAULT_Y2 : by2,
        xCoordinateMode: useRelativeX ? ECoordinateMode.Relative : ECoordinateMode.DataValue,
        yCoordinateMode: useRelativeY ? ECoordinateMode.Relative : ECoordinateMode.DataValue,
        fill: box.fill ?? box.color + SCI_CHART_BOX_FILL_OPACITY_SUFFIX,
        stroke: box.color,
        strokeThickness: SCI_CHART_SHAPE_STROKE_THICKNESS,
      })
      chartSurface.annotations.add(boxAnnotation)
      annotationRefs.current.push(boxAnnotation)
      if (box.name) {
        const labelX = box.x1 ?? (hasDataBounds ? xMin : undefined)
        const labelY = box.y2 ?? box.y1 ?? (hasDataBounds ? yMax : undefined)
        const labelAnnotation = new NativeTextAnnotation({
          x1: labelX ?? SCI_CHART_BOX_DEFAULT_X1,
          y1: labelY ?? SCI_CHART_BOX_DEFAULT_Y2,
          xCoordinateMode: labelX != null ? ECoordinateMode.DataValue : ECoordinateMode.Relative,
          yCoordinateMode: labelY != null ? ECoordinateMode.DataValue : ECoordinateMode.Relative,
          text: box.name,
          textColor: box.color,
          fontSize: SCI_CHART_BOX_LABEL_FONT_SIZE,
          horizontalAnchorPoint: EHorizontalAnchorPoint.Left,
        })
        chartSurface.annotations.add(labelAnnotation)
        annotationRefs.current.push(labelAnnotation)
      }
    }

    chartSurface.invalidateElement()

    return () => {
      for (const annotationRef of annotationRefs.current) {
        chartSurface.annotations.remove(annotationRef)
        annotationRef.delete()
      }
      annotationRefs.current = []
    }
  }, [initResult, lineShapes, boxes, data])
}
