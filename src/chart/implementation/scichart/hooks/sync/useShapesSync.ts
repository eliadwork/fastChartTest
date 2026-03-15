import { useEffect, useRef } from 'react'
import {
  BoxAnnotation,
  ECoordinateMode,
  EHorizontalAnchorPoint,
  HorizontalLineAnnotation,
  NativeTextAnnotation,
  SciChartSurface,
  VerticalLineAnnotation,
} from 'scichart'

import { dashToStrokeArray } from '../../convert'
import type { ResolvedSciChartDefinition, SciChartDataBounds } from '../../scichartOptions'
import {
  SCI_CHART_BOX_DEFAULT_X1,
  SCI_CHART_BOX_DEFAULT_X2,
  SCI_CHART_BOX_DEFAULT_Y1,
  SCI_CHART_BOX_DEFAULT_Y2,
  SCI_CHART_BOX_FILL_OPACITY_SUFFIX,
  SCI_CHART_BOX_LABEL_FONT_SIZE,
  SCI_CHART_SHAPE_STROKE_THICKNESS,
} from '../../sciChartWrapperConstants'

export interface UseShapesSyncOptions {
  surface?: SciChartSurface
  shapes: ResolvedSciChartDefinition['shapes']
  dataBounds: SciChartDataBounds
}

export const useShapesSync = ({ surface, shapes, dataBounds }: UseShapesSyncOptions) => {
  const annotationRefs = useRef<
    (VerticalLineAnnotation | HorizontalLineAnnotation | BoxAnnotation | NativeTextAnnotation)[]
  >([])

  useEffect(() => {
    if (!surface) return

    for (const annotationRef of annotationRefs.current) {
      surface.annotations.remove(annotationRef)
      annotationRef.delete()
    }
    annotationRefs.current = []

    const { xMin, xMax, yMin, yMax, hasValidBounds } = dataBounds

    for (const shape of shapes) {
      if (shape.shape !== 'box') {
        const strokeDashArray = dashToStrokeArray(shape.dash)
        const annotation =
          shape.axis === 'x'
            ? new VerticalLineAnnotation({
                x1: shape.value,
                stroke: shape.color,
                strokeThickness: SCI_CHART_SHAPE_STROKE_THICKNESS,
                strokeDashArray,
              })
            : new HorizontalLineAnnotation({
                y1: shape.value,
                stroke: shape.color,
                strokeThickness: SCI_CHART_SHAPE_STROKE_THICKNESS,
                strokeDashArray,
              })
        surface.annotations.add(annotation)
        annotationRefs.current.push(annotation)
        continue
      }

      const box = shape
      const bx1 = box.coordinates.x1 ?? (hasValidBounds ? xMin : SCI_CHART_BOX_DEFAULT_X1)
      const bx2 = box.coordinates.x2 ?? (hasValidBounds ? xMax : SCI_CHART_BOX_DEFAULT_X2)
      const by1 = box.coordinates.y1 ?? (hasValidBounds ? yMin : SCI_CHART_BOX_DEFAULT_Y1)
      const by2 = box.coordinates.y2 ?? (hasValidBounds ? yMax : SCI_CHART_BOX_DEFAULT_Y2)
      const useRelativeX = box.coordinates.x1 == null && box.coordinates.x2 == null && !hasValidBounds
      const useRelativeY = box.coordinates.y1 == null && box.coordinates.y2 == null && !hasValidBounds
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
      surface.annotations.add(boxAnnotation)
      annotationRefs.current.push(boxAnnotation)
      if (box.name) {
        const labelX = box.coordinates.x1 ?? (hasValidBounds ? xMin : undefined)
        const labelY = box.coordinates.y2 ?? box.coordinates.y1 ?? (hasValidBounds ? yMax : undefined)
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
        surface.annotations.add(labelAnnotation)
        annotationRefs.current.push(labelAnnotation)
      }
    }

    surface.invalidateElement()

    return () => {
      for (const annotationRef of annotationRefs.current) {
        surface.annotations.remove(annotationRef)
        annotationRef.delete()
      }
      annotationRefs.current = []
    }
  }, [surface, shapes, dataBounds])
}
