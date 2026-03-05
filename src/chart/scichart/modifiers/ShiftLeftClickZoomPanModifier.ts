import { ModifierMouseArgs, ZoomPanModifier } from 'scichart'

const LEFT_MOUSE_BUTTON = 0

/** Pan modifier that only activates on Shift + left-click. */
export class ShiftLeftClickZoomPanModifier extends ZoomPanModifier {
  modifierMouseDown(args: ModifierMouseArgs): void {
    if (args.button !== LEFT_MOUSE_BUTTON) return
    super.modifierMouseDown(args)
  }

  modifierMouseUp(args: ModifierMouseArgs): void {
    if (args.button !== LEFT_MOUSE_BUTTON) return
    super.modifierMouseUp(args)
  }
}
