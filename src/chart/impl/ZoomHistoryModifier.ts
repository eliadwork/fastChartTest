import {
  ChartModifierBase2D,
  EChart2DModifierType,
  ModifierMouseArgs,
  NumberRange,
} from 'scichart'
import { useZoomBackStore } from '../../store/zoomBackStore'

interface StoredRange {
  x: NumberRange
  y: NumberRange
}

export interface ZoomHistoryModifierOptions {
  chartId?: string
}

export class ZoomHistoryModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom
  private history: StoredRange[] = []
  private isRestoring = false
  private chartId: string | undefined
  private unregister: (() => void) | undefined

  constructor(options?: ZoomHistoryModifierOptions) {
    super()
    this.chartId = options?.chartId
  }

  onAttach(): void {
    super.onAttach()
    if (this.chartId) {
      this.unregister = useZoomBackStore.getState().register(
        this.chartId,
        () => this.restorePrevious()
      )
      this.updateStoreCanZoomBack()
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
    this.unregister?.()
    this.unregister = undefined
    super.onDetach()
  }

  private pushCurrentState(): void {
    if (this.isRestoring) return
    const current = this.captureRange()
    if (!current) return
    if (this.history.length > 0 && !this.rangesDiffer(current, this.history[this.history.length - 1])) return
    this.history.push(this.cloneRange(current))
    this.updateStoreCanZoomBack()
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

  private updateStoreCanZoomBack(): void {
    if (this.chartId) {
      useZoomBackStore.getState().setCanZoomBack(this.chartId, this.history.length > 0)
    }
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
    this.updateStoreCanZoomBack()
  }
}
