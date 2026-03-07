import { ModifierMouseArgs, RubberBandXyZoomModifier } from 'scichart';

const LEFT_MOUSE_BUTTON = 0;

/** RubberBand zoom that only activates on left-click. */
export class LeftClickRubberBandXyZoomModifier extends RubberBandXyZoomModifier {
  modifierMouseDown(args: ModifierMouseArgs): void {
    if (args.button !== LEFT_MOUSE_BUTTON) return;
    super.modifierMouseDown(args);
  }
}
