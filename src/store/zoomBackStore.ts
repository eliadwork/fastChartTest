import { create } from 'zustand'

interface ZoomBackState {
  handlers: Record<string, () => void>
  pushBeforeResetHandlers: Record<string, () => void>
  canZoomBack: Record<string, boolean>
  register: (chartId: string, zoomBack: () => void) => () => void
  registerPushBeforeReset: (chartId: string, pushBeforeReset: () => void) => () => void
  setCanZoomBack: (chartId: string, can: boolean) => void
  zoomBack: (chartId: string) => void
  pushBeforeReset: (chartId: string) => void
  canZoomBackFor: (chartId: string) => boolean
}

export const useZoomBackStore = create<ZoomBackState>((set, get) => ({
  handlers: {},
  pushBeforeResetHandlers: {},
  canZoomBack: {},

  register: (chartId, zoomBack) => {
    set((s) => ({
      handlers: { ...s.handlers, [chartId]: zoomBack },
      canZoomBack: { ...s.canZoomBack, [chartId]: false },
    }))
    return () => {
      set((s) => {
        const { [chartId]: _, ...handlers } = s.handlers
        const { [chartId]: __, ...canZoomBack } = s.canZoomBack
        return { handlers, canZoomBack }
      })
    }
  },

  registerPushBeforeReset: (chartId, pushBeforeReset) => {
    set((s) => ({
      pushBeforeResetHandlers: { ...s.pushBeforeResetHandlers, [chartId]: pushBeforeReset },
    }))
    return () => {
      set((s) => {
        const { [chartId]: _, ...pushBeforeResetHandlers } = s.pushBeforeResetHandlers
        return { pushBeforeResetHandlers }
      })
    }
  },

  setCanZoomBack: (chartId, can) => {
    set((s) => ({ canZoomBack: { ...s.canZoomBack, [chartId]: can } }))
  },

  zoomBack: (chartId) => {
    get().handlers[chartId]?.()
  },

  pushBeforeReset: (chartId) => {
    get().pushBeforeResetHandlers[chartId]?.()
  },

  canZoomBackFor: (chartId) => get().canZoomBack[chartId] ?? false,
}))
