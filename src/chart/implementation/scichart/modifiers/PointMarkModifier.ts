import {
  ChartModifierBase2D,
  EChart2DModifierType,
  ModifierMouseArgs,
  Point,
  translateFromCanvasToSeriesViewRect,
} from 'scichart';

const CLICK_THRESHOLD_PX = 5;
const MIDDLE_MOUSE_BUTTON = 1;

export interface IPointMarkModifierOptions {
  onMiddleClick?: (event: MouseEvent) => void;
}

/**
 * Point mark modifier: fires on middle-click (scroll wheel click, not box drag).
 * Calls optional handler with MouseEvent only.
 * Chart coordinates are attached on the event object as:
 * chartXValue, chartYValue, getSeriesVisibility.
 * No annotations added – shapes come from options.shapes.
 */
export class PointMarkModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom;
  private onMiddleClick?: (event: MouseEvent) => void;
  private mouseDownPoint: Point | undefined;

  constructor(options?: IPointMarkModifierOptions) {
    super();
    this.onMiddleClick = options?.onMiddleClick;
  }

  modifierMouseDown(args: ModifierMouseArgs): void {
    super.modifierMouseDown(args);
    if (args.button !== MIDDLE_MOUSE_BUTTON) return;
    this.mouseDownPoint = { x: args.mousePoint.x, y: args.mousePoint.y };
  }

  modifierMouseUp(args: ModifierMouseArgs): void {
    super.modifierMouseUp(args);
    if (args.button !== MIDDLE_MOUSE_BUTTON) {
      this.mouseDownPoint = undefined;
      return;
    }
    const down = this.mouseDownPoint;
    this.mouseDownPoint = undefined;
    if (!down || !this.onMiddleClick) return;

    if (args.shiftKey || args.ctrlKey || args.altKey) return;

    const dx = args.mousePoint.x - down.x;
    const dy = args.mousePoint.y - down.y;
    if (dx * dx + dy * dy > CLICK_THRESHOLD_PX * CLICK_THRESHOLD_PX) return;

    const translated = translateFromCanvasToSeriesViewRect(
      args.mousePoint,
      this.parentSurface.seriesViewRect
    );
    if (!translated) return;

    const xAxis = this.getIncludedXAxis()[0];
    if (!xAxis) return;

    const coordCalc = xAxis.getCurrentCoordinateCalculator();
    if (!coordCalc) return;

    const xValue = coordCalc.getDataValue(translated.x);
    const yAxis = this.getIncludedYAxis()[0];
    const yCoordCalc = yAxis?.getCurrentCoordinateCalculator();
    const yValue = yCoordCalc ? yCoordCalc.getDataValue(translated.y) : 0;

    const rect = this.parentSurface.domCanvas2D?.getBoundingClientRect();
    const clientX = rect ? rect.left + args.mousePoint.x : args.mousePoint.x;
    const clientY = rect ? rect.top + args.mousePoint.y : args.mousePoint.y;

    const mouseEvent = new MouseEvent('click', {
      clientX,
      clientY,
      button: MIDDLE_MOUSE_BUTTON,
      bubbles: true,
    });
    const getSeriesVisibility = () =>
      this.parentSurface.renderableSeries
        .asArray()
        .map((rs) => (rs as { isVisible: boolean }).isVisible);

    const middleClickEvent = Object.assign(mouseEvent, {
      chartXValue: xValue,
      chartYValue: yValue,
      getSeriesVisibility,
    });

    this.onMiddleClick(middleClickEvent);
  }
}
