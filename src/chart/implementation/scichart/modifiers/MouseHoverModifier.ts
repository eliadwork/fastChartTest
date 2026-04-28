import {
  ChartModifierBase2D,
  EChart2DModifierType,
  ModifierMouseArgs,
  translateFromCanvasToSeriesViewRect,
} from 'scichart';

export interface MouseHoverModifierOptions {
  onHover?: (event: MouseEvent) => void;
}

/**
 * Generic mouse-hover modifier. Calls the optional hover handler with a MouseEvent
 * on every mouse move over the chart. Chart coordinates are attached on the event
 * object as: chartXValue, chartYValue.
 */
export class MouseHoverModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom;
  private onHover?: (event: MouseEvent) => void;

  constructor(options?: MouseHoverModifierOptions) {
    super();
    this.onHover = options?.onHover;
    this.receiveHandledEvents = true;
    console.log('[MouseHoverModifier] constructed; onHover set:', this.onHover != null);
  }

  modifierMouseMove(args: ModifierMouseArgs): void {
    super.modifierMouseMove(args);
    console.log('[MouseHoverModifier] modifierMouseMove fired, onHover set:', this.onHover != null);
    if (!this.onHover) return;

    const translated = translateFromCanvasToSeriesViewRect(
      args.mousePoint,
      this.parentSurface.seriesViewRect
    );
    if (!translated) return;

    const xAxis = this.getIncludedXAxis()[0];
    if (!xAxis) return;

    const xCoordCalc = xAxis.getCurrentCoordinateCalculator();
    if (!xCoordCalc) return;

    const xValue = xCoordCalc.getDataValue(translated.x);
    const yAxis = this.getIncludedYAxis()[0];
    const yCoordCalc = yAxis?.getCurrentCoordinateCalculator();
    const yValue = yCoordCalc ? yCoordCalc.getDataValue(translated.y) : 0;

    const rect = this.parentSurface.domCanvas2D?.getBoundingClientRect();
    const clientX = rect ? rect.left + args.mousePoint.x : args.mousePoint.x;
    const clientY = rect ? rect.top + args.mousePoint.y : args.mousePoint.y;

    const mouseEvent = new MouseEvent('mousemove', {
      clientX,
      clientY,
      bubbles: true,
    });

    const hoverEvent = Object.assign(mouseEvent, {
      chartXValue: xValue,
      chartYValue: yValue,
    });

    this.onHover(hoverEvent);
  }
}
