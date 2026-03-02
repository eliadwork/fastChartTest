import {
  ChartModifierBase2D,
  EChart2DModifierType,
  ModifierMouseArgs,
  Point,
  translateFromCanvasToSeriesViewRect,
  VerticalLineAnnotation,
} from 'scichart'
import type { ConvertedShape } from '../convert'

const CLICK_THRESHOLD_PX = 5

export interface IPointMarkModifierOptions {
  onPointMark?: (xValue: number) => ConvertedShape | ConvertedShape[] | null
}

/**
 * Point mark modifier: fires on click (not box drag) with x value.
 * Calls optional handler; if handler returns shape(s), adds them as vertical line annotations.
 */
export class PointMarkModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom
  private onPointMark?: (xValue: number) => ConvertedShape | ConvertedShape[] | null
  private mouseDownPoint: Point | undefined

  constructor(options?: IPointMarkModifierOptions) {
    super()
    this.onPointMark = options?.onPointMark
  }

  modifierMouseDown(args: ModifierMouseArgs): void {
    super.modifierMouseDown(args)
    this.mouseDownPoint = { x: args.mousePoint.x, y: args.mousePoint.y }
  }

  modifierMouseUp(args: ModifierMouseArgs): void {
    super.modifierMouseUp(args)
    const down = this.mouseDownPoint
    this.mouseDownPoint = undefined
    if (!down || !this.onPointMark) return

    if (args.shiftKey || args.ctrlKey || args.altKey) return

    const dx = args.mousePoint.x - down.x
    const dy = args.mousePoint.y - down.y
    if (dx * dx + dy * dy > CLICK_THRESHOLD_PX * CLICK_THRESHOLD_PX) return

    const translated = translateFromCanvasToSeriesViewRect(
      args.mousePoint,
      this.parentSurface.seriesViewRect
    )
    if (!translated) return

    const xAxis = this.getIncludedXAxis()[0]
    if (!xAxis) return

    const coordCalc = xAxis.getCurrentCoordinateCalculator()
    if (!coordCalc) return

    const xValue = coordCalc.getDataValue(translated.x)
    const shapes = this.onPointMark(xValue)
    if (!shapes) return

    const toAdd = Array.isArray(shapes) ? shapes : [shapes]
    for (const shape of toAdd) {
      if (shape.lineAxis === 'x') {
        this.parentSurface.annotations.add(
          new VerticalLineAnnotation({
            x1: shape.lineValue,
            stroke: shape.color,
            strokeThickness: 2,
            strokeDashArray: shape.strokeDashArray,
          })
        )
      }
    }
  }
}
