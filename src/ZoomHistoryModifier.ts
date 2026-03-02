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

/**
 * Zoom history modifier: captures state at the START of zoom gestures (mouseDown, wheel)
 * and restores on "Back" button click. This ensures we always capture the exact
 * state before box zoom, stretch, pan, or scroll zoom.
 */
export class ZoomHistoryModifier extends ChartModifierBase2D {
  readonly type = EChart2DModifierType.Custom
  private history: StoredRange[] = []
  private isRestoring = false
  private backButton: HTMLButtonElement | null = null

  onAttach(): void {
    super.onAttach()
    this.addBackButton()
  }

  modifierMouseDown(args: ModifierMouseArgs): void {
    super.modifierMouseDown(args)
    this.pushCurrentState()
  }

  modifierMouseWheel(args: ModifierMouseArgs): void {
    super.modifierMouseWheel(args)
    this.pushCurrentState()
  }

  private pushCurrentState(): void {
    if (this.isRestoring) return
    const current = this.captureRange()
    if (!current) return
    if (this.history.length > 0 && !this.rangesDiffer(current, this.history[this.history.length - 1])) return
    this.history.push(this.cloneRange(current))
    this.updateBackButton()
  }

  private cloneRange(r: StoredRange): StoredRange {
    return {
      x: new NumberRange(r.x.min, r.x.max),
      y: new NumberRange(r.y.min, r.y.max),
    }
  }

  onDetach(): void {
    this.removeBackButton()
    super.onDetach()
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

  private addBackButton(): void {
    const root = this.parentSurface.domCanvas2D?.parentElement
    if (!root) return
    const btn = document.createElement('button')
    btn.textContent = '← Zoom back'
    btn.className = 'zoom-history-back-btn'
    btn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 100;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      background: rgba(255,255,255,0.9);
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `
    btn.disabled = true
    btn.onclick = () => this.restorePrevious()
    root.style.position = 'relative'
    root.appendChild(btn)
    this.backButton = btn
  }

  private removeBackButton(): void {
    this.backButton?.remove()
    this.backButton = null
  }

  private updateBackButton(): void {
    if (this.backButton) {
      this.backButton.disabled = this.history.length === 0
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
    this.updateBackButton()
  }
}
