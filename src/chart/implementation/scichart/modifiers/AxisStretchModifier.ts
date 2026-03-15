import {
  ChartModifierBase2D,
  EChart2DModifierType,
  ModifierMouseArgs,
  Point,
  translateFromCanvasToSeriesViewRect,
} from 'scichart';

import type { SciChartModifierExecuteCondition } from './modifierExecuteCondition';

const DEFAULT_SENSITIVITY = 0.002;

export interface IAxisStretchModifierOptions {
  executeCondition?: SciChartModifierExecuteCondition;
  sensitivity?: number;
}

export class AxisStretchModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom;
  private pointFrom: Point | undefined;
  private sensitivity: number;

  constructor(options?: IAxisStretchModifierOptions) {
    const { executeCondition, sensitivity, ...rest } = options ?? {};
    super({
      ...rest,
      executeCondition,
    });
    this.sensitivity = sensitivity ?? DEFAULT_SENSITIVITY;
  }

  private isActive(args: ModifierMouseArgs): boolean {
    return this.checkExecuteConditions(args).isPrimary ?? false;
  }

  modifierMouseDown(args: ModifierMouseArgs): void {
    super.modifierMouseDown(args);
    if (!this.isActive(args)) return;
    const translated = translateFromCanvasToSeriesViewRect(
      args.mousePoint,
      this.parentSurface.seriesViewRect
    );
    if (translated) {
      this.pointFrom = { x: args.mousePoint.x, y: args.mousePoint.y };
    }
  }

  modifierMouseMove(args: ModifierMouseArgs): void {
    super.modifierMouseMove(args);
    // During drag, move events often have button=0; only require isActive on mouseDown
    const inDrag = !!this.pointFrom;
    const active = inDrag || this.isActive(args);
    if (!this.pointFrom || !active) return;
    const { seriesViewRect } = this.parentSurface;
    const deltaX = args.mousePoint.x - this.pointFrom.x;
    const deltaY = this.pointFrom.y - args.mousePoint.y;

    const horizontalFraction = (deltaX / seriesViewRect.width) * this.sensitivity;
    const verticalFraction = (deltaY / seriesViewRect.height) * this.sensitivity;

    const mousePoint = translateFromCanvasToSeriesViewRect(args.mousePoint, seriesViewRect, true);
    if (!mousePoint) return;

    if (Math.abs(horizontalFraction) > 1e-6) {
      this.getIncludedXAxis().forEach((axis) => {
        this.growBy(mousePoint, axis, horizontalFraction);
      });
    }
    if (Math.abs(verticalFraction) > 1e-6) {
      this.getIncludedYAxis().forEach((axis) => {
        this.growBy(mousePoint, axis, verticalFraction);
      });
    }

    this.pointFrom = { x: args.mousePoint.x, y: args.mousePoint.y };
    args.handled = true;
  }

  modifierMouseUp(args: ModifierMouseArgs): void {
    super.modifierMouseUp(args);
    this.pointFrom = undefined;
  }
}
