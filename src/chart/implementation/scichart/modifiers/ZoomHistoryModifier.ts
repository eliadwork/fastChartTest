import {
  ChartModifierBase2D,
  EChart2DModifierType,
  ModifierMouseArgs,
  NumberRange,
} from 'scichart'

interface StoredRange {
  x: NumberRange
  y: NumberRange
}

export interface ZoomHistoryModifierCallbacks {
  setZoomBack: (fn: () => void) => void
  setPushBeforeReset: (fn: () => void) => void
  setCanZoomBack: (can: boolean) => void
}

export interface ZoomHistoryModifierOptions {
  callbacks?: ZoomHistoryModifierCallbacks
}

export class ZoomHistoryModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom
  private history: StoredRange[] = []
  private isRestoring = false
  private callbacks: ZoomHistoryModifierCallbacks | undefined

  constructor(options?: ZoomHistoryModifierOptions) {
    super()
    this.callbacks = options?.callbacks
  }

  onAttach(): void {
    super.onAttach()
    if (this.callbacks) {
      this.callbacks.setZoomBack(() => this.restorePrevious())
      this.callbacks.setPushBeforeReset(() => this.pushCurrentState())
      this.updateCanZoomBack()
    }
  }

  modifierMouseDown(args: ModifierMouseArgs): void {
    super.modifierMouseDown(args)
    this.pushCurrentState()
  }

  modifierMouseWheel(args: ModifierMouseArgs): void {
    super.modifierMouseWheel(args)
    this.pushCurrentState()
  }

  onDetach(): void {
    super.onDetach()
  }

  pushCurrentState(): void {
    if (this.isRestoring) return
    const current = this.captureRange()
    if (!current) return
    if (this.history.length > 0 && !this.rangesDiffer(current, this.history[this.history.length - 1])) return
    this.history.push(this.cloneRange(current))
    this.updateCanZoomBack()
  }

  private cloneRange(r: StoredRange): StoredRange {
    return {
      x: new NumberRange(r.x.min, r.x.max),
      y: new NumberRange(r.y.min, r.y.max),
    }
  }

  private captureRange(): StoredRange | null {
    const xAxis = this.getIncludedXAxis()[0]
    const yAxis = this.getIncludedYAxis()[0]
    if (!xAxis?.visibleRange || !yAxis?.visibleRange) return null
    return {
      x: new NumberRange(xAxis.visibleRange.min, xAxis.visibleRange.max),
      y: new NumberRange(yAxis.visibleRange.min, yAxis.visibleRange.max),
    }
  }

  private rangesDiffer(a: StoredRange, b: StoredRange): boolean {
    const eps = 1e-10
    return (
      Math.abs(a.x.min - b.x.min) > eps ||
      Math.abs(a.x.max - b.x.max) > eps ||
      Math.abs(a.y.min - b.y.min) > eps ||
      Math.abs(a.y.max - b.y.max) > eps
    )
  }

  private updateCanZoomBack(): void {
    this.callbacks?.setCanZoomBack(this.history.length > 0)
  }

  private restorePrevious(): void {
    const prev = this.history.pop()
    if (!prev) return
    const xAxis = this.getIncludedXAxis()[0]
    const yAxis = this.getIncludedYAxis()[0]
    if (!xAxis || !yAxis) return
    this.isRestoring = true
    xAxis.visibleRange = new NumberRange(prev.x.min, prev.x.max)
    yAxis.visibleRange = new NumberRange(prev.y.min, prev.y.max)
    this.isRestoring = false
    this.updateCanZoomBack()
  }
}
