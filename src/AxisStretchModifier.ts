import {
  ChartModifierBase2D,
  EChart2DModifierType,
  EModifierMouseArgKey,
  ModifierMouseArgs,
  Point,
  translateFromCanvasToSeriesViewRect,
} from 'scichart'

const DEFAULT_SENSITIVITY = 0.002

export interface IAxisStretchModifierOptions {
  executeCondition?: { key: EModifierMouseArgKey }
  /** Sensitivity: pixel delta / chart dimension = fraction. Higher = more stretch per pixel */
  sensitivity?: number
}

/**
 * Axis stretch modifier: Shift+drag to independently zoom X and Y axes.
 * Horizontal drag stretches X axis, vertical drag stretches Y axis.
 * Lets you control aspect ratio between X and Y (1:1, stretch X, stretch Y, etc).
 */
export class AxisStretchModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom
  private pointFrom: Point | undefined
  private sensitivity: number

  constructor(options?: IAxisStretchModifierOptions) {
    super({
      ...options,
      executeCondition: options?.executeCondition ?? { key: EModifierMouseArgKey.Shift },
    })
    this.sensitivity = options?.sensitivity ?? DEFAULT_SENSITIVITY
  }

  modifierMouseDown(args: ModifierMouseArgs): void {
    super.modifierMouseDown(args)
    if (!this.checkExecuteConditions(args).isPrimary) return
    const translated = translateFromCanvasToSeriesViewRect(
      args.mousePoint,
      this.parentSurface.seriesViewRect
    )
    if (translated) {
      this.pointFrom = { x: args.mousePoint.x, y: args.mousePoint.y }
    }
  }

  modifierMouseMove(args: ModifierMouseArgs): void {
    super.modifierMouseMove(args)
    if (!this.pointFrom || !this.checkExecuteConditions(args).isPrimary) return
    const { seriesViewRect } = this.parentSurface
    const deltaX = args.mousePoint.x - this.pointFrom.x
    const deltaY = this.pointFrom.y - args.mousePoint.y // Y flipped: up = positive

    const horizontalFraction = (deltaX / seriesViewRect.width) * this.sensitivity
    const verticalFraction = (deltaY / seriesViewRect.height) * this.sensitivity

    const mousePoint = translateFromCanvasToSeriesViewRect(
      args.mousePoint,
      seriesViewRect,
      true
    )
    if (!mousePoint) return

    if (Math.abs(horizontalFraction) > 1e-6) {
      this.getIncludedXAxis().forEach((axis) => {
        this.growBy(mousePoint, axis, horizontalFraction)
      })
    }
    if (Math.abs(verticalFraction) > 1e-6) {
      this.getIncludedYAxis().forEach((axis) => {
        this.growBy(mousePoint, axis, verticalFraction)
      })
    }

    this.pointFrom = { x: args.mousePoint.x, y: args.mousePoint.y }
    args.handled = true
  }

  modifierMouseUp(args: ModifierMouseArgs): void {
    super.modifierMouseUp(args)
    this.pointFrom = undefined
  }
}
