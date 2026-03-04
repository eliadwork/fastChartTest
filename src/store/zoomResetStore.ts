import { create } from 'zustand'

interface ZoomResetState {
  handlers: Record<string, () => void>
  register: (chartId: string, zoomReset: () => void) => () => void
  zoomReset: (chartId: string) => void
}

export const useZoomResetStore = create<ZoomResetState>((set, get) => ({
  handlers: {},

  register: (chartId, zoomReset) => {
    set((s) => ({
      handlers: { ...s.handlers, [chartId]: zoomReset },
    }))
    return () => {
      set((s) => {
        const { [chartId]: _, ...handlers } = s.handlers
        return { handlers }
      })
    }
  },

  zoomReset: (chartId) => {
    get().handlers[chartId]?.()
  },
}))
