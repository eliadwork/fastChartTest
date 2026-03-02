import {
  ChartModifierBase2D,
  ECoordinateMode,
  EHorizontalAnchorPoint,
  EChart2DModifierType,
  EVerticalAnchorPoint,
  ModifierMouseArgs,
  NativeTextAnnotation,
  Point,
  translateFromCanvasToSeriesViewRect,
  VerticalLineAnnotation,
} from 'scichart'
import type { ConvertedShape } from '../convert'

const CLICK_THRESHOLD_PX = 5
const MIDDLE_MOUSE_BUTTON = 1

export type PointMarkResult =
  | ConvertedShape
  | { type: 'marker'; x: number; icon?: string; color?: string }
  | (ConvertedShape | { type: 'marker'; x: number; icon?: string; color?: string })[]

export interface PointMarkContext {
  getSeriesVisibility: () => boolean[]
}

export interface IPointMarkModifierOptions {
  onPointMark?: (xValue: number, yValue: number, context?: PointMarkContext) => PointMarkResult | null
}

/**
 * Point mark modifier: fires on middle-click (scroll wheel click, not box drag) with x value.
 * Calls optional handler; if handler returns shape(s), adds them as vertical line annotations.
 */
export class PointMarkModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom
  private onPointMark?: (xValue: number, yValue: number, context?: PointMarkContext) => PointMarkResult | null
  private mouseDownPoint: Point | undefined

  constructor(options?: IPointMarkModifierOptions) {
    super()
    this.onPointMark = options?.onPointMark
  }

  modifierMouseDown(args: ModifierMouseArgs): void {
    super.modifierMouseDown(args)
    if (args.button !== MIDDLE_MOUSE_BUTTON) return
    this.mouseDownPoint = { x: args.mousePoint.x, y: args.mousePoint.y }
  }

  modifierMouseUp(args: ModifierMouseArgs): void {
    super.modifierMouseUp(args)
    if (args.button !== MIDDLE_MOUSE_BUTTON) {
      this.mouseDownPoint = undefined
      return
    }
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
    const yAxis = this.getIncludedYAxis()[0]
    const yCoordCalc = yAxis?.getCurrentCoordinateCalculator()
    const yValue = yCoordCalc ? yCoordCalc.getDataValue(translated.y) : 0
    const context: PointMarkContext = {
      getSeriesVisibility: () =>
        this.parentSurface.renderableSeries.asArray().map((rs) => (rs as { isVisible: boolean }).isVisible),
    }
    const result = this.onPointMark(xValue, yValue, context)
    if (!result) return

    const toAdd = Array.isArray(result) ? result : [result]
    for (const item of toAdd) {
      if ('type' in item && item.type === 'marker') {
        const xAxis = this.getIncludedXAxis()[0]
        const yAxis = this.getIncludedYAxis()[0]
        const xRange = xAxis?.visibleRange
        const yRange = yAxis?.visibleRange
        const xSpan = xRange ? xRange.diff : 1
        const ySpan = yRange ? yRange.diff : 1
        const deltaX = xSpan * 0.06
        const deltaY = ySpan * 0.06
        const yCoordCalc = yAxis?.getCurrentCoordinateCalculator()
        const yValue = yCoordCalc ? yCoordCalc.getDataValue(translated.y) : 0
        this.parentSurface.annotations.add(
          new NativeTextAnnotation({
            x1: item.x,
            x2: item.x + deltaX,
            y1: yValue,
            y2: yValue + deltaY,
            xCoordinateMode: ECoordinateMode.DataValue,
            yCoordinateMode: ECoordinateMode.DataValue,
            text: item.icon ?? '📍',
            textColor: item.color ?? '#3388ff',
            fontSize: 16,
            horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
            verticalAnchorPoint: EVerticalAnchorPoint.Center,
            scaleOnResize: true,
          })
        )
      } else if ('lineAxis' in item && item.lineAxis === 'x') {
        this.parentSurface.annotations.add(
          new VerticalLineAnnotation({
            x1: item.lineValue,
            stroke: item.color,
            strokeThickness: 2,
            strokeDashArray: item.strokeDashArray,
          })
        )
      }
    }
  }
}
