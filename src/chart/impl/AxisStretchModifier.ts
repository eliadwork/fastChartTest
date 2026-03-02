import {
  ChartModifierBase2D,
  EChart2DModifierType,
  EModifierMouseArgKey,
  ModifierMouseArgs,
  Point,
  translateFromCanvasToSeriesViewRect,
} from 'scichart'

const DEFAULT_SENSITIVITY = 0.002
const RIGHT_MOUSE_BUTTON = 2

export interface IAxisStretchModifierOptions {
  executeCondition?: { key: EModifierMouseArgKey }
  /** When true, only activate on right-click (button 2). Overrides executeCondition key check. */
  executeOnRightClick?: boolean
  sensitivity?: number
}

export class AxisStretchModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom
  private pointFrom: Point | undefined
  private sensitivity: number
  private executeOnRightClick: boolean

  constructor(options?: IAxisStretchModifierOptions) {
    const { executeOnRightClick, executeCondition, sensitivity, ...rest } = options ?? {}
    super({
      ...rest,
      executeCondition: executeOnRightClick
        ? { key: EModifierMouseArgKey.None }
        : executeCondition ?? { key: EModifierMouseArgKey.Shift },
    })
    this.sensitivity = sensitivity ?? DEFAULT_SENSITIVITY
    this.executeOnRightClick = executeOnRightClick === true
  }

  private isActive(args: ModifierMouseArgs): boolean {
    if (this.executeOnRightClick) return args.button === RIGHT_MOUSE_BUTTON
    return this.checkExecuteConditions(args).isPrimary ?? false
  }

  modifierMouseDown(args: ModifierMouseArgs): void {
    super.modifierMouseDown(args)
    if (!this.isActive(args)) return
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
    // During drag, move events often have button=0; only require isActive on mouseDown
    const inDrag = !!this.pointFrom
    const active = inDrag || this.isActive(args)
    if (!this.pointFrom || !active) return
    const { seriesViewRect } = this.parentSurface
    const deltaX = args.mousePoint.x - this.pointFrom.x
    const deltaY = this.pointFrom.y - args.mousePoint.y

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
