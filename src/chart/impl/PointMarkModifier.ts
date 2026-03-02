import {
  ChartModifierBase2D,
  CustomAnnotation,
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
import { toSvgString } from './iconUtils'

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
  /** Icon size multiplier. 1 = default, 1.5 = 50% bigger. */
  iconSize?: number
}

/**
 * Point mark modifier: fires on middle-click (scroll wheel click, not box drag) with x value.
 * Calls optional handler; if handler returns shape(s), adds them as vertical line annotations.
 */
const DEFAULT_ICON_SIZE = 1

export class PointMarkModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom
  private onPointMark?: (xValue: number, yValue: number, context?: PointMarkContext) => PointMarkResult | null
  private mouseDownPoint: Point | undefined
  private iconSize: number

  constructor(options?: IPointMarkModifierOptions) {
    super()
    this.onPointMark = options?.onPointMark
    this.iconSize = options?.iconSize ?? DEFAULT_ICON_SIZE
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
        const yAxis = this.getIncludedYAxis()[0]
        const yCoordCalc = yAxis?.getCurrentCoordinateCalculator()
        const yValue = yCoordCalc ? yCoordCalc.getDataValue(translated.y) : 0
        const iconStr = item.icon ?? ''
        const color = item.color ?? '#3388ff'
        const isSvg = iconStr.startsWith('<')
        const px = Math.round(24 * this.iconSize)
        if (isSvg) {
          this.parentSurface.annotations.add(
            new CustomAnnotation({
              x1: item.x,
              y1: yValue,
              xCoordinateMode: ECoordinateMode.DataValue,
              yCoordinateMode: ECoordinateMode.DataValue,
              horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
              verticalAnchorPoint: EVerticalAnchorPoint.Center,
              svgString: toSvgString(iconStr, px, color),
            })
          )
        } else {
          this.parentSurface.annotations.add(
            new NativeTextAnnotation({
              x1: item.x,
              y1: yValue,
              xCoordinateMode: ECoordinateMode.DataValue,
              yCoordinateMode: ECoordinateMode.DataValue,
              text: iconStr || '●',
              textColor: color,
              fontSize: Math.round(16 * this.iconSize),
              horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
              verticalAnchorPoint: EVerticalAnchorPoint.Center,
            })
          )
        }
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
